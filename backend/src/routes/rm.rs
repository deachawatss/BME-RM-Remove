use actix_web::{get, post, web, HttpResponse, Responder};
use log::{error, info};

use crate::db::mssql::{get_f64, get_i32, get_optional_f64, get_string, MssqlPool};
use crate::models::rm::{RemoveRequest, RemoveResponse, RMLine, SearchResponse};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(search_rm_lines)
        .service(remove_partial_qty);
}

#[get("/rm/search")]
async fn search_rm_lines(
    pool: web::Data<MssqlPool>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> impl Responder {
    let runno = match query.get("runno") {
        Some(val) => match val.parse::<i32>() {
            Ok(v) => v,
            Err(_) => {
                return HttpResponse::BadRequest().json(SearchResponse {
                    success: false,
                    data: vec![],
                    message: "Invalid runno parameter".to_string(),
                });
            }
        },
        None => {
            return HttpResponse::BadRequest().json(SearchResponse {
                success: false,
                data: vec![],
                message: "Missing runno parameter".to_string(),
            });
        }
    };

    info!("Searching RM lines for RunNo: {}", runno);

    let sql = format!(
        r#"
        SELECT
            RunNo,
            RowNum,
            BatchNo,
            LineTyp,
            LineId,
            ItemKey,
            Location,
            Unit,
            StandardQty,
            PackSize,
            ToPickedPartialQty,
            PickedPartialQty,
            RecUserId,
            ModifiedBy
        FROM cust_PartialPicked
        WHERE RunNo = {}
          AND ToPickedPartialQty > 0
          AND (PickedPartialQty IS NULL OR PickedPartialQty <= 0)
        ORDER BY RowNum
        "#,
        runno
    );

    let result = pool
        .execute_query(&sql, |row| {
            Ok(RMLine {
                run_no: get_i32(row, "RunNo"),
                row_num: get_i32(row, "RowNum"),
                batch_no: get_string(row, "BatchNo"),
                line_typ: get_string(row, "LineTyp"),
                line_id: get_i32(row, "LineId"),
                item_key: get_string(row, "ItemKey"),
                location: get_string(row, "Location"),
                unit: get_string(row, "Unit"),
                standard_qty: get_f64(row, "StandardQty"),
                pack_size: get_f64(row, "PackSize"),
                to_picked_partial_qty: get_f64(row, "ToPickedPartialQty"),
                picked_partial_qty: get_optional_f64(row, "PickedPartialQty"),
                rec_user_id: get_string(row, "RecUserId"),
                modified_by: get_string(row, "ModifiedBy"),
            })
        })
        .await;

    match result {
        Ok(lines) => {
            let count = lines.len();
            info!("Found {} RM lines for RunNo: {}", count, runno);
            HttpResponse::Ok().json(SearchResponse {
                success: true,
                data: lines,
                message: format!("Found {} records", count),
            })
        }
        Err(e) => {
            error!("Database error searching RM lines: {}", e);
            HttpResponse::InternalServerError().json(SearchResponse {
                success: false,
                data: vec![],
                message: format!("Database error: {}", e),
            })
        }
    }
}

#[post("/rm/remove")]
async fn remove_partial_qty(
    pool: web::Data<MssqlPool>,
    request: web::Json<RemoveRequest>,
) -> impl Responder {
    let RemoveRequest {
        run_no,
        row_nums,
        user_logon,
    } = request.into_inner();

    if row_nums.is_empty() {
        return HttpResponse::BadRequest().json(RemoveResponse {
            success: false,
            message: "No row numbers provided".to_string(),
            affected_rows: 0,
        });
    }

    info!(
        "Removing partial quantities for RunNo: {}, Rows: {:?}, User: {}",
        run_no, row_nums, user_logon
    );

    let sql = r#"
        UPDATE cust_PartialPicked
        SET
            User8 = ToPickedPartialQty,
            User9 = CAST(DATEDIFF(SECOND, '1970-01-01', GETDATE()) AS DECIMAL),
            User3 = LEFT(@P1, 8),
            ToPickedPartialQty = 0,
            ModifiedBy = LEFT(@P1, 8),
            ModifiedDate = GETDATE()
        WHERE RunNo = @P2
          AND RowNum = @P3
          AND ToPickedPartialQty > 0
    "#;

    let mut total_affected: u64 = 0;
    let mut errors: Vec<String> = vec![];

    for row_num in &row_nums {
        let user_logon_clone = user_logon.clone();
        let result = pool
            .execute_update(sql, |query| {
                query.bind(user_logon_clone.clone());
                query.bind(run_no);
                query.bind(*row_num);
            })
            .await;

        match result {
            Ok(affected) => {
                total_affected += affected;
                if affected == 0 {
                    errors.push(format!("Row {} not found or already processed", row_num));
                }
            }
            Err(e) => {
                error!("Error updating row {}: {}", row_num, e);
                errors.push(format!("Row {}: {}", row_num, e));
            }
        }
    }

    if errors.is_empty() {
        info!(
            "Successfully removed partial quantities for {} rows",
            total_affected
        );
        HttpResponse::Ok().json(RemoveResponse {
            success: true,
            message: format!("Successfully updated {} rows", total_affected),
            affected_rows: total_affected as usize,
        })
    } else if total_affected > 0 {
        HttpResponse::PartialContent().json(RemoveResponse {
            success: true,
            message: format!(
                "Partially completed: {} rows updated. Errors: {}",
                total_affected,
                errors.join(", ")
            ),
            affected_rows: total_affected as usize,
        })
    } else {
        HttpResponse::InternalServerError().json(RemoveResponse {
            success: false,
            message: format!("Failed to update any rows. Errors: {}", errors.join(", ")),
            affected_rows: 0,
        })
    }
}
