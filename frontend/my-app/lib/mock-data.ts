/**
 * Mock Data for RM Partial Picking Remover
 * NWFTH - Northern Wind Food Thailand
 */

import { RMLine } from '@/types/rm';

/**
 * Generate realistic mock RM data for testing
 */
export function generateMockRMData(runNo: number): RMLine[] {
  const baseData: RMLine[] = [
    {
      RunNo: runNo,
      RowNum: 1,
      BatchNo: 'RM2024001',
      LineTyp: 'RM',
      LineId: 1001,
      ItemKey: 'FLOUR-001',
      Location: 'WH-A-01',
      Unit: 'KG',
      StandardQty: 500.0,
      PackSize: 25.0,
      ToPickedPartialQty: 100.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'john.smith',
    },
    {
      RunNo: runNo,
      RowNum: 2,
      BatchNo: 'RM2024002',
      LineTyp: 'RM',
      LineId: 1002,
      ItemKey: 'SUGAR-002',
      Location: 'WH-A-02',
      Unit: 'KG',
      StandardQty: 200.0,
      PackSize: 50.0,
      ToPickedPartialQty: 50.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'mary.johnson',
    },
    {
      RunNo: runNo,
      RowNum: 3,
      BatchNo: 'RM2024003',
      LineTyp: 'RM',
      LineId: 1003,
      ItemKey: 'BUTTER-003',
      Location: 'WH-C-01',
      Unit: 'KG',
      StandardQty: 100.0,
      PackSize: 10.0,
      ToPickedPartialQty: 30.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'michael.brown',
    },
    {
      RunNo: runNo,
      RowNum: 4,
      BatchNo: 'RM2024004',
      LineTyp: 'RM',
      LineId: 1004,
      ItemKey: 'EGGS-004',
      Location: 'WH-C-02',
      Unit: 'BOX',
      StandardQty: 50.0,
      PackSize: 12.0,
      ToPickedPartialQty: 10.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'sarah.davis',
    },
    {
      RunNo: runNo,
      RowNum: 5,
      BatchNo: 'RM2024005',
      LineTyp: 'RM',
      LineId: 1005,
      ItemKey: 'MILK-005',
      Location: 'WH-C-03',
      Unit: 'LTR',
      StandardQty: 300.0,
      PackSize: 5.0,
      ToPickedPartialQty: 60.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'david.wilson',
    },
    {
      RunNo: runNo,
      RowNum: 6,
      BatchNo: 'RM2024006',
      LineTyp: 'RM',
      LineId: 1006,
      ItemKey: 'SALT-006',
      Location: 'WH-A-03',
      Unit: 'KG',
      StandardQty: 150.0,
      PackSize: 25.0,
      ToPickedPartialQty: 25.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'emily.taylor',
    },
    {
      RunNo: runNo,
      RowNum: 7,
      BatchNo: 'RM2024007',
      LineTyp: 'RM',
      LineId: 1007,
      ItemKey: 'YEAST-007',
      Location: 'WH-B-01',
      Unit: 'KG',
      StandardQty: 80.0,
      PackSize: 1.0,
      ToPickedPartialQty: 5.0,
      PickedPartialQty: 5.0, // Already picked - should not be selectable
      RecUserId: 'SYSTEM',
      ModifiedBy: 'john.smith',
    },
    {
      RunNo: runNo,
      RowNum: 8,
      BatchNo: 'RM2024008',
      LineTyp: 'RM',
      LineId: 1008,
      ItemKey: 'OIL-008',
      Location: 'WH-A-04',
      Unit: 'LTR',
      StandardQty: 250.0,
      PackSize: 20.0,
      ToPickedPartialQty: 0.0, // No partial pick - should not be selectable
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'mary.johnson',
    },
    {
      RunNo: runNo,
      RowNum: 9,
      BatchNo: 'RM2024009',
      LineTyp: 'RM',
      LineId: 1009,
      ItemKey: 'VANILLA-009',
      Location: 'WH-B-02',
      Unit: 'ML',
      StandardQty: 20.0,
      PackSize: 500.0,
      ToPickedPartialQty: 2.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'michael.brown',
    },
    {
      RunNo: runNo,
      RowNum: 10,
      BatchNo: 'RM2024010',
      LineTyp: 'RM',
      LineId: 1010,
      ItemKey: 'COCOA-010',
      Location: 'WH-B-03',
      Unit: 'KG',
      StandardQty: 120.0,
      PackSize: 15.0,
      ToPickedPartialQty: 45.0,
      PickedPartialQty: 0.0,
      RecUserId: 'SYSTEM',
      ModifiedBy: 'sarah.davis',
    },
  ];

  return baseData;
}

/**
 * Get mock RM data for a specific RunNo
 */
export function getMockRMData(runNo: number): RMLine[] {
  // Simulate no data found for certain run numbers
  if (runNo === 999999) {
    return [];
  }

  return generateMockRMData(runNo);
}

/**
 * Simulate API delay
 */
export function simulateDelay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a row is selectable based on criteria:
 * ToPickedPartialQty > 0 AND PickedPartialQty <= 0
 */
export function isRowSelectable(row: RMLine): boolean {
  return row.ToPickedPartialQty > 0 && row.PickedPartialQty <= 0;
}
