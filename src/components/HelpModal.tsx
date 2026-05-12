import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';

export const HowItWorksModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full">
        <LogOut size={20} className="rotate-45 text-neutral-400" />
      </button>
      <h2 className="text-2xl font-bold font-serif mb-6">Nasıl Çalışır?</h2>
      <div className="space-y-4 text-brand-text text-sm leading-relaxed">
        <p>PrintForge AI ile ürünlerinizi oluşturmak çok kolay:</p>
        <ol className="list-decimal pl-4 space-y-2">
          <li><strong>Niş Analizi:</strong> İlgilendiğiniz nişleri "Niş Bulucu" ile araştırın ve kaydedin.</li>
          <li><strong>Paket Oluşturma:</strong> "Yeni Paket" butonuna basarak ürün tipini, tarzını ve hedef kitlenizi girin. Yapay zekamız sizin için özelleştirilmiş tasarım fikirleri ve Etsy için optimize edilmiş başlık ve açıklamalar üretir.</li>
          <li><strong>Görselleştirme:</strong> Üretilen tasarım tariflerini, görsel üreten yapay zeka araçlarına (Midjourney, DALL-E vb.) girerek benzersiz görsellerinizi oluşturun.</li>
          <li><strong>Platforma Yükleme:</strong> Canva için özel olarak hazırlanan teknik özelliklere (ölçü, font vb.) göre tasarımlarınızı düzenleyin ve Etsy gibi platformlara yükleyin.</li>
        </ol>
      </div>
      <button onClick={onClose} className="w-full mt-8 py-3 bg-brand-primary text-white rounded-xl font-bold">Anlaşıldı</button>
    </motion.div>
  </div>
);
