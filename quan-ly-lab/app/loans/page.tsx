'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<Record<number, string>>({}); // Biến lưu tên thiết bị (ID -> Name)
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Tải dữ liệu: Lấy cả danh sách mượn VÀ danh sách thiết bị
  async function fetchData() {
    setLoading(true);
    
    // A. Lấy danh sách đang mượn (chưa trả)
    const { data: loansData } = await supabase
      .from('loans')
      .select('*')
      .eq('returned', false)
      .order('created_at', { ascending: false });
    
    setLoans(loansData || []);

    // B. Lấy danh sách thiết bị để biết cái ID 1 tên là gì
    const { data: equipData } = await supabase
      .from('equipment')
      .select('id, name');
    
    // Chuyển đổi mảng thiết bị thành dạng Object cho dễ tra cứu: { 1: "Kit DE2", 2: "Kit FPGA"... }
    const equipMap: Record<number, string> = {};
    if (equipData) {
      equipData.forEach((item: any) => {
        equipMap[item.id] = item.name;
      });
    }
    setEquipments(equipMap);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // 2. Xử lý Trả đồ (Quan trọng)
  async function handleReturn(loan: any) {
    if (!confirm(`Xác nhận thu hồi thiết bị từ ${loan.student_name}?`)) return;

    try {
      // BƯỚC 1: Đánh dấu đã trả trong bảng loans
      const { error: updateLoanError } = await supabase
        .from('loans')
        .update({ returned: true })
        .eq('id', loan.id);
      
      if (updateLoanError) throw updateLoanError;

      // BƯỚC 2: Cộng lại số lượng vào kho (Bảng equipment)
      // Lấy số lượng hiện tại trước
      const { data: currentKit } = await supabase
        .from('equipment')
        .select('available_qty')
        .eq('id', loan.kit_id)
        .single();

      if (currentKit) {
        // Cộng thêm 1
        await supabase
          .from('equipment')
          .update({ available_qty: currentKit.available_qty + 1 })
          .eq('id', loan.kit_id);
      }

      alert('✅ Đã thu hồi & Cập nhật kho thành công!');
      fetchData(); // Tải lại trang để cập nhật danh sách

    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  }

  // 3. Logic Tìm kiếm
  const filteredLoans = loans.filter(loan => {
    const search = searchTerm.toLowerCase();
    return (
      loan.student_name.toLowerCase().includes(search) || 
      loan.mssv.toLowerCase().includes(search)
    );
  });

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      <h1 className="text-3xl font-black text-blue-800 mb-6 flex items-center gap-2">
        List of Borrowing Boards⏳
        <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
          {filteredLoans.length}
        </span>
      </h1>

      {/* Thanh tìm kiếm */}
      <div className="mb-6 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input 
          type="text" 
          placeholder="Tìm theo tên sinh viên hoặc MSSV..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-black"
        />
      </div>

      {/* Danh sách */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-500 text-center italic">Đang tải dữ liệu...</p>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-dashed">
            <p className="text-gray-500">
              {searchTerm ? 'Không tìm thấy kết quả nào.' : 'Hiện không có sinh viên mượn.'}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div key={loan.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Ảnh thẻ sinh viên */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                <img src={loan.card_url} className="w-full h-full object-cover" alt="Card" />
              </div>
              
              {/* Thông tin chính */}
              <div className="flex-1 text-center sm:text-left w-full">
                <h3 className="font-bold text-lg text-gray-900">{loan.student_name}</h3>
                <p className="text-gray-500 text-sm">MSSV: <span className="font-mono text-black">{loan.mssv}</span></p>
                
                {/* Hiện Tên Thiết Bị (Thay vì ID) */}
                <div className="mt-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm inline-block font-medium">
                   Mượn: <b>{equipments[loan.kit_id] || `Kit ID: ${loan.kit_id}`}</b>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">
                  📅 {new Date(loan.created_at).toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Nút Trả */}
              <button 
                onClick={() => handleReturn(loan)}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-2 rounded-lg font-bold transition whitespace-nowrap active:scale-95"
              >
                Xác nhận trả ⏎
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}