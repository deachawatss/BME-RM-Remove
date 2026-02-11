use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RMLine {
    pub run_no: i32,
    pub row_num: i32,
    pub batch_no: String,
    pub line_typ: String,
    pub line_id: i32,
    pub item_key: String,
    pub location: String,
    pub unit: String,
    pub standard_qty: f64,
    pub pack_size: f64,
    pub to_picked_partial_qty: f64,
    pub picked_partial_qty: Option<f64>,
    pub rec_user_id: String,
    pub modified_by: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct SearchRequest {
    pub runno: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoveRequest {
    pub run_no: i32,
    pub row_nums: Vec<i32>,
    pub user_logon: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoveResponse {
    pub success: bool,
    pub message: String,
    pub affected_rows: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResponse {
    pub success: bool,
    pub data: Vec<RMLine>,
    pub message: String,
}
