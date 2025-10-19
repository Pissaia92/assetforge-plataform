export interface AssetCheckedOutEvent {
  assetId: number; // O ID do ativo que está sendo designado
  employeeId: number; // O ID do funcionário ao qual o ativo está sendo designado
  timestamp: string; // Timestamp ISO 8601 da ocorrência do evento
}
