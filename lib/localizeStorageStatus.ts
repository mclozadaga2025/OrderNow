import type { AppLanguage } from '@/lib/useLanguage';

const VI_STORAGE_STATUS: Record<string, string> = {
  'Loading local JSON...': 'Đang tải JSON cục bộ...',
  'No local JSON yet. Create or import data to start.':
    'Chưa có JSON cục bộ. Hãy tạo hoặc nhập dữ liệu để bắt đầu.',
  'Local JSON loaded.': 'Đã tải JSON cục bộ.',
  'Local JSON could not be loaded.': 'Không thể tải JSON cục bộ.',
  'Local JSON saved.': 'Đã lưu JSON cục bộ.',
  'Import canceled.': 'Đã hủy nhập dữ liệu.',
  'Group saved to local JSON.': 'Đã lưu nhóm vào JSON cục bộ.',
  'Group deleted and transaction history kept in local JSON.':
    'Đã xóa nhóm và thành viên, giữ lại lịch sử giao dịch.',
  'Group and transaction history deleted from local JSON.':
    'Đã xóa nhóm, thành viên và lịch sử giao dịch liên quan.',
  'Member saved to local JSON.': 'Đã lưu thành viên vào JSON cục bộ.',
  'Menu item saved to local JSON.': 'Đã lưu mục chi phí vào JSON cục bộ.',
  'Menu item updated in local JSON.': 'Đã cập nhật mục chi phí trong JSON cục bộ.',
  'Menu item deleted from local JSON.': 'Đã xóa mục chi phí khỏi JSON cục bộ.',
  'Venue saved to local JSON.': 'Đã lưu địa điểm vào JSON cục bộ.',
  'Top-up saved to local JSON.': 'Đã lưu khoản nạp vào JSON cục bộ.',
  'Transfer saved to local JSON.': 'Đã lưu giao dịch trao đổi vào JSON cục bộ.',
  'Transaction saved to local JSON.': 'Đã lưu giao dịch vào JSON cục bộ.',
  'Transaction deleted from local JSON.': 'Đã xóa giao dịch khỏi JSON cục bộ.',
  'Transaction restored in local JSON.': 'Đã khôi phục số dư và xóa giao dịch khỏi JSON cục bộ.',
};

export function localizeStorageStatus(status: string, language: AppLanguage) {
  if (language === 'en') {
    return status;
  }

  const exportedFileName = status.match(/^Exported (.+)\.$/)?.[1];
  if (exportedFileName) {
    return `Đã xuất ${exportedFileName}.`;
  }

  const importedCounts = status.match(/^Imported (\d+) groups, (\d+) members, (\d+) venues\.$/);
  if (importedCounts) {
    return `Đã nhập ${importedCounts[1]} nhóm, ${importedCounts[2]} thành viên, ${importedCounts[3]} địa điểm.`;
  }

  return VI_STORAGE_STATUS[status] ?? status;
}
