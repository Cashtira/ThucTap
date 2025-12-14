'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditKitPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State lưu thông tin Kit để sửa
  const [formData, setFormData] = useState({
    name: '',
    total_qty: 0,
    available_qty: 0,
    image_url: ''
  });

  // Tải dữ liệu cũ lên để sửa
  useEffect(() => {
    async function fetchKit() {
      if (!id) return;
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setFormData({
          name: data.name,
          total_qty: data.total_qty,
          available_qty: data.available_qty,
          image_url: data.image_url || ''
        });
      }
    }
    fetchKit();
  }, [id]);

  // Xử lý khi thay đổi ô nhập liệu
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý Upload ảnh mới
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileName = `kit-${id}-${Date.now()}`; // Đặt tên file tránh trùng
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      
      if (error) throw error;

      // Lấy link ảnh
      const publicUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));

    } catch (error: any) {
      alert('Lỗi upload ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lưu tất cả thay đổi vào Database
  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('equipment')
      .update({
        name: formData.name,
        total_qty: parseInt(formData.total_qty.toString()), // Đảm bảo là số
        available_qty: parseInt(formData.available_qty.toString()),
        image_url: formData.image_url
      })
      .eq('id', id);

    setLoading(false);

    if (error) alert('Lỗi lưu: ' + error.message);
    else {
      alert('✅ Đã cập nhật thông tin Kit!');
      router.push('/'); // Lưu xong quay về trang chủ
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">Thông tin chi tiết</h1>
        <Link href="/" className="text-gray-500 hover:text-black">❌ Hủy bỏ</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 border p-6 rounded-xl shadow-sm">
        
        {/* Tên Kit */}
        <div>
          <label className="block font-bold mb-1">Tên thiết bị:</label>
          <input 
            type="text" name="name" 
            value={formData.name} onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Số lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">Tổng nhập về:</label>
            <input 
              type="number" name="total_qty" 
              value={formData.total_qty} onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Hiện còn trong kho:</label>
            <input 
              type="number" name="available_qty" 
              value={formData.available_qty} onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Upload Ảnh */}
        <div>
          <label className="block font-bold mb-2">Ảnh thông số / Phụ kiện:</label>
          
          {/* Preview ảnh hiện tại */}
          {formData.image_url && (
            <div className="mb-3 p-2 border rounded bg-gray-50 text-center">
              <img src={formData.image_url} alt="Preview" className="h-40 mx-auto object-contain" />
              <p className="text-xs text-gray-400 mt-1">Ảnh hiện tại</p>
            </div>
          )}

          <input 
            type="file" accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-400 mt-1">Chọn ảnh mới để thay thế ảnh cũ (Tự động upload)</p>
        </div>

        {/* Nút Lưu */}
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
        </button>

      </form>
    </div>
  );
}