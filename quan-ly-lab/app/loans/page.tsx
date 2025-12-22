'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<Record<number, string>>({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // State cho Modal Nhắc Nhở
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null); // Lưu thông tin người cần nhắc

  // Tải dữ liệu
  async function fetchData() {
    setLoading(true);
    const { data: loansData } = await supabase
      .from('loans')
      .select('*')
      .eq('returned', false)
      .order('created_at', { ascending: false });
    
    setLoans(loansData || []);

    const { data: equipData } = await supabase.from('equipment').select('id, name');
    const equipMap: Record<number, string> = {};
    if (equipData) {
      equipData.forEach((item: any) => equipMap[item.id] = item.name);
    }
    setEquipments(equipMap);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // Xử lý Trả đồ
  async function handleReturn(loan: any) {
    if (!confirm(`Xác nhận thu hồi thiết bị từ ${loan.student_name}?`)) return;

    try {
      const { error: updateLoanError } = await supabase.from('loans').update({ returned: true }).eq('id', loan.id);
      if (updateLoanError) throw updateLoanError;

      const { data: currentKit } = await supabase.from('equipment').select('available_qty').eq('id', loan.kit_id).single();
      if (currentKit) {
        await supabase.from('equipment').update({ available_qty: currentKit.available_qty + 1 }).eq('id', loan.kit_id);
      }
      alert('✅ Đã thu hồi thành công!');
      fetchData(); 
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  }

  // Logic Mở Modal Nhắc nhở
  const openReminder = (loan: any) => {
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  // Hàm Copy vào Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào bộ nhớ đệm!');
  };

  // Logic Tìm kiếm
  const filteredLoans = loans.filter(loan => {
    const search = searchTerm.toLowerCase();
    return (
      loan.student_name.toLowerCase().includes(search) || 
      loan.mssv.toLowerCase().includes(search)
    );
  });

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20 relative">
      <h1 className="text-3xl font-black text-blue-800 mb-6 flex items-center gap-2">
        Danh Sách Mượn ⏳
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">{filteredLoans.length}</span>
      </h1>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input 
          type="text" placeholder="Tìm tên hoặc MSSV..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-blue-500 text-black shadow-sm"
        />
      </div>

      {/* Danh sách */}
      <div className="grid gap-4">
        {filteredLoans.map((loan) => (
          <div key={loan.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border shrink-0">
              <img src={loan.card_url} className="w-full h-full object-cover" alt="Card" />
            </div>
            
            <div className="flex-1 text-center sm:text-left w-full">
              <h3 className="font-bold text-lg text-black">{loan.student_name}</h3>
              <p className="text-gray-500 text-sm">MSSV: <span className="font-mono text-black font-bold">{loan.mssv}</span></p>
              <div className="mt-1 text-blue-700 text-sm font-medium">
                 Mượn: {equipments[loan.kit_id] || `Kit #${loan.kit_id}`}
              </div>
              <p className="text-xs text-gray-400 mt-1">📅 {new Date(loan.created_at).toLocaleString('vi-VN')}</p>
            </div>

            {/* Cụm nút bấm */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button 
                onClick={() => handleReturn(loan)}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 text-sm"
              >
                Xác nhận trả?
              </button>
              
              {/* Nút Nhắc Nhở Mới */}
              <button 
                onClick={() => openReminder(loan)}
                className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold hover:bg-yellow-200 text-sm flex items-center justify-center gap-1"
              >
                🔔 Nhắc nhở
              </button>
            </div>
          </div>
        ))}
        {filteredLoans.length === 0 && <p className="text-center text-gray-500 italic mt-8">Không tìm thấy dữ liệu.</p>}
      </div>

      {/* --- NHẮC NHỞ --- */}
      {isModalOpen && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold text-gray-800">📧 Soạn Email Nhắc Nhở</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-2xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Phần 1: Email người nhận */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gửi đến (To):</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={`${selectedLoan.mssv}@gm.uit.edu.vn`} 
                    className="flex-1 bg-gray-100 p-2 rounded border text-gray-700 font-mono text-sm"
                  />
                  <button onClick={() => copyToClipboard(`${selectedLoan.mssv}@gm.uit.edu.vn`)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-xs hover:bg-blue-200">Copy</button>
                </div>
              </div>

              {/* Phần 2: Tiêu đề Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề (Subject):</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={`[ASIC LAB] Thông báo nhắc trả thiết bị: ${equipments[selectedLoan.kit_id] || 'Kit Thí Nghiệm'}`} 
                    className="flex-1 bg-gray-100 p-2 rounded border text-gray-700 text-sm"
                  />
                  <button onClick={() => copyToClipboard(`[ASIC LAB] Thông báo nhắc trả thiết bị: ${equipments[selectedLoan.kit_id] || 'Kit Thí Nghiệm'}`)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-xs hover:bg-blue-200">Copy</button>
                </div>
              </div>

              {/* Phần 3: Nội dung Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nội dung (Body):</label>
                <div className="relative">
                  <textarea 
                    readOnly 
                    rows={6}
                    className="w-full bg-gray-100 p-3 rounded border text-gray-700 text-sm leading-relaxed"
                    value={`Chào bạn ${selectedLoan.student_name} (MSSV: ${selectedLoan.mssv}),\n\nHệ thống ghi nhận bạn đang mượn thiết bị: ${equipments[selectedLoan.kit_id] || 'Kit'}.\nThời gian mượn: ${new Date(selectedLoan.created_at).toLocaleString('vi-VN')}.\n\nVui lòng sắp xếp thời gian hoàn trả thiết bị về phòng Lab sớm nhất có thể.\n\nTrân trọng,\nBan Quản Lý ASIC Lab.`}
                  />
                  <button 
                    onClick={() => copyToClipboard(`Chào bạn ${selectedLoan.student_name} (MSSV: ${selectedLoan.mssv}),\n\nHệ thống ghi nhận bạn đang mượn thiết bị: ${equipments[selectedLoan.kit_id] || 'Kit'}.\nThời gian mượn: ${new Date(selectedLoan.created_at).toLocaleString('vi-VN')}.\n\nVui lòng sắp xếp thời gian hoàn trả thiết bị về phòng Lab sớm nhất có thể.\n\nTrân trọng,\nBan Quản Lý ASIC Lab.`)} 
                    className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-xs hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}