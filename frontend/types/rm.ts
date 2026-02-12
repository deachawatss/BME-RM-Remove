/**
 * Raw Material Partial Picking Types
 * NWFTH - Northern Wind Food Thailand
 */

/**
 * Represents a single Raw Material line from cust_PartialPicked table
 */
export interface RMLine {
  /** Run number - primary identifier */
  RunNo: number;

  /** Row number within the run */
  RowNum: number;

  /** Batch number */
  BatchNo: string;

  /** Line type (e.g., 'RM', 'FG') */
  LineTyp: string;

  /** Line ID */
  LineId: number;

  /** Item key/code */
  ItemKey: string;

  /** Storage location */
  Location: string;

  /** Unit of measure */
  Unit: string;

  /** Standard quantity */
  StandardQty: number;

  /** Pack size */
  PackSize: number;

  /** Target partial picked quantity */
  ToPickedPartialQty: number;

  /** Actual partial picked quantity */
  PickedPartialQty: number;

  /** User who created the record */
  RecUserId: string;

  /** User who last modified the record */
  ModifiedBy: string;
}

/**
 * Filter criteria for RM lines
 * Only rows where ToPickedPartialQty > 0 AND PickedPartialQty <= 0 are selectable
 */
export interface RMFilterCriteria {
  /** Run number to search */
  runNo: number;

  /** Only show rows with ToPickedPartialQty > 0 */
  hasPendingPicks: boolean;

  /** Only show rows with PickedPartialQty <= 0 */
  notYetPicked: boolean;
}

/**
 * Selection state for RM lines
 */
export interface RMSelectionState {
  /** Set of selected row composite keys (RowNum-LineId) */
  selectedRows: Set<string>;

  /** Whether all selectable rows are selected */
  isAllSelected: boolean;

  /** Count of selected rows */
  selectedCount: number;
}

/**
 * API Response for RM data fetch
 */
export interface RMDataResponse {
  /** List of RM lines */
  data: RMLine[];

  /** Total count of records */
  totalCount: number;

  /** Count of selectable records */
  selectableCount: number;

  /** Error message if any */
  error?: string;
}

/**
 * Item to be removed
 */
export interface RMRemoveItem {
  rowNum: number;
  lineId: number;
}

/**
 * Remove operation request
 */
export interface RMRemoveRequest {
  /** Run number */
  runNo: number;

  /** Array of items to remove */
  items: RMRemoveItem[];

  /** User performing the operation */
  userId: string;
}

/**
 * Remove operation response
 */
export interface RMRemoveResponse {
  /** Whether operation was successful */
  success: boolean;

  /** Number of records affected */
  affectedCount: number;

  /** Error message if failed */
  error?: string;

  /** Detailed error info */
  details?: string;
}

/**
 * Audit columns for tracking changes
 * Maps to User8, User9, User3 columns in database
 */
export interface RMAuditInfo {
  /** Original quantity before removal (stored in User8) */
  originalQty: number;

  /** Timestamp of operation (stored in User9) */
  timestamp: string;

  /** User login (stored in User3) */
  userLogon: string;
}
