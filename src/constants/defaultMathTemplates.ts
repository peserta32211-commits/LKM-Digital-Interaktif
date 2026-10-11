import { LkmConfig } from '../types';

// Preset 1: Eksplorasi Matriks & Sistem Persamaan Linier (3 Agen)
export const templateMat3: LkmConfig = {
  pin: 'MAT-2088',
  title: 'Eksplorasi Matriks & Sistem Persamaan Linier (SPLDV)',
  subject: 'Matematika',
  topic: 'Matriks 2x2, Determinan, Invers & Pemodelan Biaya Produksi',
  grade: 'SMA Kelas 11 (Fase F)',
  timerMinutes: 25,
  agentCount: 3,
  storyBriefing: 'Halo Tim Matematikawan Analis! Sebuah unit usaha bakery UMKM sedang merancang strategi optimasi bahan baku untuk 2 varian kue unggulan: Roti Cokelat (x) dan Roti Keju (y). Tersedia persediaan tepung dan mentega terbatas setiap pagi. Tim kalian ditugaskan memodelkan sistem persamaan linier ke dalam bentuk perkalian matriks [ ᵃ  ᵇ / ᶜ  ᵈ ] [ ˣ / ʸ ] = [ ᵇ¹ / ᵇ² ], menghitung determinan |A| dan invers A⁻¹, serta menentukan solusi harga dan kuantitas produksi optimal!',
  clues: [
    {
      title: 'Petunjuk 1: Model Sistem Persamaan Linier (SPLDV)',
      badge: 'PERSAMAAN MATRIKS',
      content: 'Persamaan bahan baku harian: 2x + 3y = 12.000 (tepung terigu) dan 4x + 2y = 16.000 (mentega). Dalam bentuk matriks: [ 2  3 / 4  2 ] [ x / y ] = [ 12.000 / 16.000 ].',
    },
    {
      title: 'Petunjuk 2: Rumus Determinan & Invers Matriks 2x2',
      badge: 'DETERMINAN & INVERS',
      content: 'Untuk matriks A = [ a  b / c  d ], nilai determinan adalah |A| = ad − bc. Matriks memiliki invers jika dan hanya jika det(A) ≠ 0. Rumus invers: A⁻¹ = (1 / det(A)) · [ d  −b / −c  a ].',
    },
    {
      title: 'Petunjuk 3: Kaidah Cramer & Solusi Tunggal',
      badge: 'SOLUSI SISTEM',
      content: 'Nilai variabel x = det(Aₓ) / det(A) dan y = det(Aᵧ) / det(A). Solusi bernilai valid bila x, y ∈ ℝ⁺ (bilangan riil positif) sehingga realistis dalam produksi nyata.',
    },
  ],
  agentTasks: {
    agent1: {
      agentRole: 'agent1',
      title: 'Penyusunan Model & Analisis Determinan',
      roleName: 'Si Pemodel Matriks',
      roleNickname: 'Agen 1',
      tagline: 'Ahli Pemodelan Sistem & Determinan',
      instructions: 'Bedah persamaan SPLDV, susun matriks koefisien A, dan hitung nilai determinan |A| serta syarat keterbalikan matriks.',
      worksheetMode: 'cards',
      worksheetContent: `## 🔍 Eksplorasi Sistem Persamaan Linier (SPLDV)
Sebuah bakery memproduksi dua jenis roti: Roti Cokelat ([color:blue]x[/color]) dan Roti Keju ([color:green]y[/color]).
Persamaan bahan baku tepung dan mentega:
2x + 3y = 12.000
4x + 2y = 16.000

Dalam bentuk perkalian matriks:
[ 2  3 / 4  2 ] [ x / y ] = [ 12.000 / 16.000 ]

1. Nilai determinan matriks koefisien adalah [hl:yellow]|A| = [masukkan det*][/hl] dan tergolong [pg: Memiliki Solusi Unik* | Tak Hingga Solusi | Tidak Ada Solusi].
2. Variabel yang dihitung dalam model ini: [cb: Roti Cokelat (x)* | Roti Keju (y)* | Biaya Listrik].

Lengkapi tabel langkah eliminasi di bawah ini:
| No | Metode Aljabar | Persamaan Hasil |
|---|---|---|
| 1 | Eliminasi x | y = [isian] |
| 2 | Substitusi y | x = [isian] |`,
      questions: [
        {
          id: 'a1_q1',
          type: 'multiple_choice',
          prompt: 'Berdasarkan matriks koefisien A = [ 2  3 / 4  2 ], berapakah nilai determinan |A| = ad − bc?',
          options: [
            '−8',
            '8',
            '−4',
            '16',
          ],
          correctAnswer: '−8',
        },
        {
          id: 'a1_q2',
          type: 'short',
          prompt: 'Tuliskan nilai determinan |A| dari matriks koefisien tersebut!',
          placeholder: 'Contoh: −8',
          correctAnswer: '−8',
        },
        {
          id: 'a1_q3',
          type: 'inline_blank',
          prompt: 'Matriks koefisien memiliki determinan [−8] sehingga tergolong matriks [non-singular] yang memiliki invers unik.',
          correctAnswer: '−8',
        },
        {
          id: 'a1_q4',
          type: 'essay',
          prompt: 'Jelaskan mengapa matriks dengan nilai determinan tidak sama dengan nol (|A| ≠ 0) selalu menjamin keberadaan solusi tunggal pada sistem persamaan linier!',
          placeholder: 'Uraikan konsep geometri garis berpotongan dan sifat keterbalikan invers matriks...',
        },
      ],
    },
    agent2: {
      agentRole: 'agent2',
      title: 'Kalkulasi Invers & Penyelesaian Solusi',
      roleName: 'Si Kalkulator Invers',
      roleNickname: 'Agen 2',
      tagline: 'Ahli Algoritma Invers & Solusi',
      instructions: 'Gunakan metode Invers Matriks A⁻¹ atau Eliminasi Gauss-Jordan untuk mencari nilai variabel x dan y.',
      worksheetMode: 'cards',
      worksheetContent: `## 🧮 Perhitungan Invers Matriks dan Vektor Solusi
Diketahui matriks koefisien A = [ 2  3 / 4  2 ] dengan |A| = −8.
Adjoin matriks Adj(A) = [ 2  −3 / −4  2 ].

Maka matriks invers A⁻¹ = (1/−8) · [ 2  −3 / −4  2 ].
Perkalian dengan vektor konstanta B = [ 12.000 / 16.000 ] menghasilkan:
x = [masukkan x*] dan y = [masukkan y*].`,
      questions: [
        {
          id: 'a2_q1',
          type: 'short',
          prompt: 'Berapakah nilai variabel x (harga modal 1 Roti Cokelat dalam Rupiah)?',
          placeholder: 'Contoh: 3000',
          correctAnswer: '3000',
        },
        {
          id: 'a2_q2',
          type: 'multiple_choice',
          prompt: 'Berapakah nilai variabel y (harga modal 1 Roti Keju dalam Rupiah)?',
          options: [
            '2.000',
            '3.000',
            '1.500',
            '4.000',
          ],
          correctAnswer: '2.000',
        },
        {
          id: 'a2_q3',
          type: 'table',
          prompt: 'Lengkapi tabel pembuktian substitusi nilai (x = 3.000, y = 2.000) ke dalam persamaan bahan baku:',
          tableHeaders: ['No', 'Persamaan Asli', 'Perhitungan Substitusi', 'Status Kesamaan'],
          tableRowCount: 2,
        },
        {
          id: 'a2_q4',
          type: 'essay',
          prompt: 'Tuliskan langkah-langkah perkalian matriks A⁻¹ · B secara terperinci hingga diperoleh vektor solusi [ x / y ]!',
          placeholder: 'Uraikan langkah invers matriks dan perkalian baris kali kolom...',
        },
      ],
    },
    agent3: {
      agentRole: 'agent3',
      title: 'Pengambilan Keputusan & Optimasi Biaya',
      roleName: 'Si Pengambil Keputusan',
      roleNickname: 'Agen 3',
      tagline: 'Kapten Tim & Analis Keputusan Bisnis',
      instructions: 'Gabungkan hasil temuan Agen 1 dan Agen 2. Hitung biaya kombinasi pesanan dan rumuskan rekomendasi produksi.',
      worksheetMode: 'cards',
      worksheetContent: `## 📊 Rekomendasi Alokasi Biaya Produksi Bakery
Berdasarkan perhitungan tim, harga modal bahan:
- Roti Cokelat (x) = Rp 3.000
- Roti Keju (y) = Rp 2.000

Pesanan paket bundling: 5 Roti Cokelat + 10 Roti Keju = [masukkan total biaya*].`,
      questions: [
        {
          id: 'a3_q1',
          type: 'short',
          prompt: 'Berapakah total biaya modal jika bakery memproduksi 5 Roti Cokelat dan 10 Roti Keju (5x + 10y)?',
          placeholder: 'Contoh: 35000',
          correctAnswer: '35000',
        },
        {
          id: 'a3_q2',
          type: 'checkbox',
          prompt: 'Sifat-sifat matematis apa saja yang wajib terpenuhi pada pemodelan matriks sistem persamaan ini? (Centang semua yang tepat)',
          options: [
            'Determinan matriks koefisien tidak sama dengan nol (|A| ≠ 0)',
            'Nilai variabel x dan y harus bernilai positif (x > 0 dan y > 0)',
            'Bentuk perkalian matriks harus memenuhi ordo (2×2) × (2×1) = (2×1)',
            'Nilai determinan harus selalu bernilai positif murni',
          ],
          correctAnswer: [
            'Determinan matriks koefisien tidak sama dengan nol (|A| ≠ 0)',
            'Nilai variabel x dan y harus bernilai positif (x > 0 dan y > 0)',
            'Bentuk perkalian matriks harus memenuhi ordo (2×2) × (2×1) = (2×1)',
          ],
        },
        {
          id: 'a3_q3',
          type: 'essay',
          prompt: 'Tuliskan Rekomendasi Matematis Terpadu Kelompok untuk pemilik usaha bakery mengenai efisiensi biaya dan alokasi bahan baku!',
          placeholder: 'Rangkum kesimpulan matematis dan saran praktis kelompok...',
        },
      ],
    },
    agent4: {
      agentRole: 'agent4',
      title: 'Visualisasi Geometri & Komunikasi Tim',
      roleName: 'Si Pembawa Cerita',
      roleNickname: 'Agen 4',
      tagline: 'Ahli Grafis Koordinat & Presentasi',
      instructions: 'Sajikan grafik perpotongan dua garis lurus pada bidang Kartesius ℝ² dan buat ringkasan presentasi.',
      questions: [
        {
          id: 'a4_q1',
          type: 'short',
          prompt: 'Tuliskan titik koordinat perpotongan kedua garis (x, y) pada bidang Kartesius!',
          placeholder: 'Contoh: (3000, 2000)',
          correctAnswer: '(3000, 2000)',
        },
        {
          id: 'a4_q2',
          type: 'essay',
          prompt: 'Jelaskan bagaimana grafik kedua garis memperlihatkan bahwa sistem persamaan ini memiliki tepat satu titik potong (solusi unik)!',
          placeholder: 'Deskripsikan kemiringan garis (gradien m₁ dan m₂) serta letak titik potongnya...',
        },
      ],
    },
    agent5: {
      agentRole: 'agent5',
      title: 'Verifikasi Solusi & Audit Kualitas',
      roleName: 'Si Penjaga Kualitas',
      roleNickname: 'Agen 5',
      tagline: 'Ahli Verifikasi & Pengamat Detail',
      instructions: 'Periksa keabsahan setiap perhitungan aljabar dan pastikan laporan akhir tim akurat 100%.',
      questions: [
        {
          id: 'a5_q1',
          type: 'checkbox',
          prompt: 'Daftar periksa validasi matematika (Centang jika sudah diverifikasi):',
          options: [
            'Perhitungan determinan ad − bc sudah dicek ulang dan tepat',
            'Penyelesaian nilai x dan y terbukti memenuhi kedua persamaan',
            'Format matriks konsisten dan tidak tertukar baris serta kolomnya',
            'Semua anggota tim telah berdiskusi dan sepakat atas solusi akhir',
          ],
          correctAnswer: [
            'Perhitungan determinan ad − bc sudah dicek ulang dan tepat',
            'Penyelesaian nilai x dan y terbukti memenuhi kedua persamaan',
            'Format matriks konsisten dan tidak tertukar baris serta kolomnya',
            'Semua anggota tim telah berdiskusi dan sepakat atas solusi akhir',
          ],
        },
        {
          id: 'a5_q2',
          type: 'essay',
          prompt: 'Berikan evaluasi terhadap kekompakan tim dalam memecahkan masalah matematika terapan ini!',
          placeholder: 'Catatan evaluasi kerja tim matematikawan...',
        },
      ],
    },
  },
  createdAt: new Date().toISOString(),
};

// Preset 2: Trigonometri & Sudut Elevasi (4 Agen)
export const templateTrig4: LkmConfig = {
  pin: 'TRIG-7701',
  title: 'Trigonometri & Sudut Elevasi Arsitektur Menara Pantau',
  subject: 'Matematika',
  topic: 'Perbandingan Trigonometri (Sin, Cos, Tan), Teorema Pythagoras & Sudut Elevasi',
  grade: 'SMA Kelas 10 (Fase E)',
  timerMinutes: 20,
  agentCount: 4,
  storyBriefing: 'Perhatian Tim Arsitek & Surveyor! Sebuah tim arsitektur kota sedang merancang renovasi menara pantau cuaca. Pengukuran tinggi menara tidak memungkinkan dipanjat secara langsung. Dengan menggunakan klinometer optik dari jarak d = 60 meter di atas tanah datar, terukur sudut elevasi ke puncak menara sebesar θ = 30° dan tinggi mata pengamat h₀ = 1.6 meter. Gunakan rasio tangen tan(θ), nilai eksak sudut istimewa, dan teorema Pythagoras untuk menghitung tinggi total menara!',
  clues: [
    {
      title: 'Petunjuk 1: Definisi Rasio Tangen Sudut Siku-Siku',
      badge: 'RUMUS TRIGONOMETRI',
      content: 'Pada segitiga siku-siku △ABC dengan sudut elevasi θ: tan(θ) = sisi depan / sisi samping = h / d. Maka tinggi menara di atas mata pengamat adalah h = d · tan(θ).',
    },
    {
      title: 'Petunjuk 2: Nilai Eksak Sudut-Sudut Istimewa',
      badge: 'TABEL NILAI EKSAK',
      content: 'Untuk sudut istimewa: tan(30°) = ⅓√3 ≈ 0.577, tan(45°) = 1, tan(60°) = √3 ≈ 1.732, sin(30°) = ½, cos(30°) = ½√3.',
    },
    {
      title: 'Petunjuk 3: Tinggi Total Objek Nyata',
      badge: 'TINGGI SEBENARNYA',
      content: 'Tinggi total menara H = h + h₀ = (d · tan(θ)) + h₀, dengan h₀ adalah tinggi klinometer/mata pengamat dari permukaan tanah (1.6 meter).',
    },
  ],
  agentTasks: {
    agent1: {
      agentRole: 'agent1',
      title: 'Analisis Pengukuran & Rasio Sudut',
      roleName: 'Si Pencari Fakta',
      roleNickname: 'Agen 1',
      tagline: 'Ahli Klinometer & Sudut Elevasi',
      instructions: 'Identifikasi komponen segitiga siku-siku, sisi depan, sisi samping, dan nilai perbandingan trigonometri yang relevan.',
      questions: [
        {
          id: 'a1_q1',
          type: 'multiple_choice',
          prompt: 'Perbandingan trigonometri manakah yang menghubungkan jarak mendatar (sisi samping) dengan tinggi menara (sisi depan)?',
          options: [
            'tan(θ) = depan / samping',
            'sin(θ) = depan / miring',
            'cos(θ) = samping / miring',
            'sec(θ) = miring / samping',
          ],
          correctAnswer: 'tan(θ) = depan / samping',
        },
        {
          id: 'a1_q2',
          type: 'short',
          prompt: 'Berapakah nilai eksak dari tan(30°)?',
          placeholder: 'Contoh: ⅓√3 atau 1/√3',
          correctAnswer: '⅓√3',
        },
        {
          id: 'a1_q3',
          type: 'inline_blank',
          prompt: 'Jika jarak mendatar adalah d = 60 meter dan sudut elevasi θ = 30°, maka nilai tan(30°) bernilai [⅓√3] dan tinggi h = [20√3] meter.',
          correctAnswer: '20√3',
        },
        {
          id: 'a1_q4',
          type: 'essay',
          prompt: 'Jelaskan mengapa klinometer menggunakan konsep garis horizontal dan sudut elevasi untuk mengukur objek tinggi di lapangan!',
          placeholder: 'Uraikan prinsip kerja klinometer berdasarkan garis bidik mata dan sudut kemiringan...',
        },
      ],
    },
    agent2: {
      agentRole: 'agent2',
      title: 'Kalkulasi Tinggi & Hipotenusa Panjang Pandang',
      roleName: 'Si Penguji Coba',
      roleNickname: 'Agen 2',
      tagline: 'Ahli Komputasi Geometri & Pythagoras',
      instructions: 'Hitung tinggi menara di atas mata pengamat h, panjang jarak pandang langsung (hipotenusa r), dan tinggi total H.',
      questions: [
        {
          id: 'a2_q1',
          type: 'short',
          prompt: 'Hitunglah nilai pendekatan tinggi menara di atas mata pengamat h = 60 · (⅓√3) dengan menggunakan √3 ≈ 1.732 (dalam meter)!',
          placeholder: 'Contoh: 34.64 meter',
          correctAnswer: '34.64',
        },
        {
          id: 'a2_q2',
          type: 'multiple_choice',
          prompt: 'Berapakah tinggi total menara dari permukaan tanah jika ditambah tinggi pengamat h₀ = 1.6 meter?',
          options: [
            '36.24 meter',
            '34.64 meter',
            '61.60 meter',
            '21.60 meter',
          ],
          correctAnswer: '36.24 meter',
        },
        {
          id: 'a2_q3',
          type: 'table',
          prompt: 'Lengkapi tabel variasi sudut elevasi jika pengamat berpindah jarak:',
          tableHeaders: ['No', 'Jarak Pengamat (d)', 'Sudut Elevasi (θ)', 'Tinggi h = d·tan(θ)'],
          tableRowCount: 3,
        },
        {
          id: 'a2_q4',
          type: 'essay',
          prompt: 'Gunakan Teorema Pythagoras r² = d² + h² untuk menghitung panjang garis pandang langsung dari klinometer ke puncak menara!',
          placeholder: 'Tuliskan perhitungan hipotenusa r secara rinci...',
        },
      ],
    },
    agent3: {
      agentRole: 'agent3',
      title: 'Desain Arsitektur & Analisis Keselamatan',
      roleName: 'Si Pembuat Rencana',
      roleNickname: 'Agen 3',
      tagline: 'Kapten Tim & Analis Struktur Arsitektur',
      instructions: 'Susun spesifikasi tinggi menara untuk izin tata kota dan rancang kabel penyangga kawat sling penahan angin.',
      questions: [
        {
          id: 'a3_q1',
          type: 'short',
          prompt: 'Berapa panjang kawat sling yang dibutuhkan jika dipasang dari puncak menara (tinggi total 36.24 m) ke tanah dengan sudut 45°?',
          placeholder: 'Contoh: 51.25 meter',
          correctAnswer: '51.25',
        },
        {
          id: 'a3_q2',
          type: 'checkbox',
          prompt: 'Faktor geometris apa saja yang harus diperhitungkan dalam konstruksi menara tinggi? (Pilih semua yang benar)',
          options: [
            'Kemiringan sudut pondasi terhadap bidang horizontal (harus 90° tegak lurus)',
            'Gaya tarik kawat penyeimbang menggunakan sudut elevasi simetris',
            'Toleransi galat alat ukur klinometer (±0.5°)',
            'Warna cat menara harus selalu warna merah',
          ],
          correctAnswer: [
            'Kemiringan sudut pondasi terhadap bidang horizontal (harus 90° tegak lurus)',
            'Gaya tarik kawat penyeimbang menggunakan sudut elevasi simetris',
            'Toleransi galat alat ukur klinometer (±0.5°)',
          ],
        },
        {
          id: 'a3_q3',
          type: 'essay',
          prompt: 'Rangkum kesimpulan akhir kelompok mengenai penerapan trigonometri dalam perancangan struktur arsitektur perkotaan!',
          placeholder: 'Tuliskan laporan kesimpulan terpadu kru arsitek...',
        },
      ],
    },
    agent4: {
      agentRole: 'agent4',
      title: 'Laporan Presentasi & Infografis Lapangan',
      roleName: 'Si Pembawa Cerita',
      roleNickname: 'Agen 4',
      tagline: 'Ahli Komunikasi Infografis & Visual',
      instructions: 'Susun infografis matematis mengenai perbandingan sudut 30°, 45°, dan 60° serta buat ringkasan eksekutif.',
      questions: [
        {
          id: 'a4_q1',
          type: 'short',
          prompt: 'Apa hubungan antara besar sudut elevasi dengan jarak pengamat bila tinggi objek yang diamati tetap konstan?',
          placeholder: 'Contoh: Semakin dekat jarak, semakin besar sudut elevasinya',
          correctAnswer: 'semakin dekat jarak, semakin besar sudut elevasinya',
        },
        {
          id: 'a4_q2',
          type: 'essay',
          prompt: 'Buatlah naskah penjelasan singkat 3 paragraf untuk audiens umum mengenai kehebatan trigonometri dalam mengukur piramida dan menara raksasa tanpa perlu memanjatnya!',
          placeholder: 'Tuliskan naskah presentasi yang memikat dan inspiratif...',
        },
      ],
    },
    agent5: {
      agentRole: 'agent5',
      title: 'Audit Presisi & Kontrol Mutu Ukur',
      roleName: 'Si Penjaga Kualitas',
      roleNickname: 'Agen 5',
      tagline: 'Ahli Evaluasi & Pengamat Detail',
      instructions: 'Periksa ketelitian pembulatan desimal nilai akar dan validasi seluruh perhitungan matematis.',
      questions: [
        {
          id: 'a5_q1',
          type: 'checkbox',
          prompt: 'Daftar periksa akurasi trigonometri (Centang yang sudah dicek):',
          options: [
            'Rasio trigonometri tan = depan/samping digunakan dengan tepat',
            'Penjumlahan tinggi mata pengamat (h₀ = 1.6 m) tidak terlewatkan',
            'Nilai akar eksak (√3) dibulatkan dengan presisi minimal 2 tempat desimal',
            'Satuan panjang konsisten dalam meter',
          ],
          correctAnswer: [
            'Rasio trigonometri tan = depan/samping digunakan dengan tepat',
            'Penjumlahan tinggi mata pengamat (h₀ = 1.6 m) tidak terlewatkan',
            'Nilai akar eksak (√3) dibulatkan dengan presisi minimal 2 tempat desimal',
            'Satuan panjang konsisten dalam meter',
          ],
        },
      ],
    },
  },
  createdAt: new Date().toISOString(),
};

// Preset 3: Analisis Data, Peluang & Statistika (5 Agen)
export const templateStat5: LkmConfig = {
  pin: 'STAT-3302',
  title: 'Analisis Data & Statistika Distribusi Frekuensi Bisnis Digital',
  subject: 'Matematika',
  topic: 'Ukuran Pemusatan Data (x̄, Me, Mo) & Dispersi (Kuartil Q₁ Q₃, Jangkauan Interkuartil, Simpangan Baku σ)',
  grade: 'SMA Kelas 12 (Fase F)',
  timerMinutes: 30,
  agentCount: 5,
  storyBriefing: 'Halo Analis Data Kuantitatif! Sebuah platform startup digital sedang mengevaluasi data transaksi harian konsumen selama satu bulan penuh. Manajemen membutuhkan analisis statistik mendalam mengenai ukuran pemusatan data (rata-rata x̄, median Me, modus Mo) serta ukuran penyebaran data (kuartil bawah Q₁, kuartil atas Q₃, dan simpangan baku σ). Kelompok kalian bertindak sebagai Tim Analis Statistik: olah tabel distribusi frekuensi data tunggal dan kelompok, hitung nilai dispersi, dan rumuskan keputusan bisnis berbasis data matematis!',
  clues: [
    {
      title: 'Petunjuk 1: Ukuran Pemusatan Data (Mean, Median, Modus)',
      badge: 'PEMUSATAN DATA',
      content: 'Nilai rata-rata sampel: x̄ = (∑ xᵢ) / n. Median (Me) adalah nilai tengah setelah data diurutkan dari terkecil ke terbesar. Modus (Mo) adalah nilai dengan frekuensi pemunculan terbanyak.',
    },
    {
      title: 'Petunjuk 2: Ukuran Letak Data (Kuartil & IQR)',
      badge: 'KUARTIL DATA',
      content: 'Kuartil membagi data terurut menjadi 4 bagian sama banyak: Kuartil Bawah Q₁ (posisi 25%), Median Q₂ (50%), dan Kuartil Atas Q₃ (75%). Jangkauan Interkuartil IQR = Q₃ − Q₁.',
    },
    {
      title: 'Petunjuk 3: Ukuran Penyebaran (Ragam & Simpangan Baku)',
      badge: 'SIMPANGAN BAKU',
      content: 'Ragam varians s² = ∑(xᵢ − x̄)² / (n − 1). Simpangan baku σ = √(s²). Semakin kecil simpangan baku, semakin homogen dan konsisten data penjualan.',
    },
  ],
  agentTasks: {
    agent1: {
      agentRole: 'agent1',
      title: 'Pembersihan Data & Ukuran Pemusatan',
      roleName: 'Si Pencari Fakta',
      roleNickname: 'Agen 1',
      tagline: 'Ahli Pengolahan Data & Pemusatan',
      instructions: 'Urutkan data sampel transaksi, tentukan nilai rata-rata (x̄), median (Me), dan modus (Mo).',
      questions: [
        {
          id: 'a1_q1',
          type: 'multiple_choice',
          prompt: 'Diberikan sampel data penjualan harian: 12, 14, 15, 15, 16, 18, 20. Berapakah nilai rata-rata (x̄) data tersebut?',
          options: [
            '15.71',
            '15.00',
            '16.00',
            '14.50',
          ],
          correctAnswer: '15.71',
        },
        {
          id: 'a1_q2',
          type: 'short',
          prompt: 'Berapakah nilai median (Me) dari data sampel: 12, 14, 15, 15, 16, 18, 20?',
          placeholder: 'Contoh: 15',
          correctAnswer: '15',
        },
        {
          id: 'a1_q3',
          type: 'inline_blank',
          prompt: 'Nilai modus (Mo) data adalah [15] dengan frekuensi kemunculan sebanyak [2] kali.',
          correctAnswer: '15',
        },
        {
          id: 'a1_q4',
          type: 'essay',
          prompt: 'Jelaskan perbedaan mendasar fungsi rata-rata (mean) dan median saat menganalisis data yang memiliki nilai pencilan ekstrem (outlier)!',
          placeholder: 'Uraikan ketahanan median terhadap nilai ekstrem dibandingkan mean...',
        },
      ],
    },
    agent2: {
      agentRole: 'agent2',
      title: 'Analisis Kuartil & Jangkauan Interkuartil',
      roleName: 'Si Penguji Coba',
      roleNickname: 'Agen 2',
      tagline: 'Ahli Dispersi & Kuartil',
      instructions: 'Hitung nilai kuartil bawah Q₁, kuartil atas Q₃, dan rentang interkuartil IQR.',
      questions: [
        {
          id: 'a2_q1',
          type: 'short',
          prompt: 'Berapakah nilai kuartil bawah (Q₁) dari data terurut: 12, 14, 15, 15, 16, 18, 20?',
          placeholder: 'Contoh: 14',
          correctAnswer: '14',
        },
        {
          id: 'a2_q2',
          type: 'multiple_choice',
          prompt: 'Berapakah nilai Jangkauan Interkuartil IQR = Q₃ − Q₁ jika Q₃ = 18 dan Q₁ = 14?',
          options: [
            '4',
            '6',
            '2',
            '8',
          ],
          correctAnswer: '4',
        },
        {
          id: 'a2_q3',
          type: 'table',
          prompt: 'Lengkapi tabel perhitungan deviasi terhadap nilai rata-rata (xᵢ − x̄):',
          tableHeaders: ['Data (xᵢ)', 'Rata-rata (x̄)', 'Selisih (xᵢ − x̄)', 'Kuadrat Selisih (xᵢ − x̄)²'],
          tableRowCount: 3,
        },
        {
          id: 'a2_q4',
          type: 'essay',
          prompt: 'Bagaimana rumus batas pagar luar digunakan untuk mendeteksi apakah suatu data tergolong pencilan (outlier)?',
          placeholder: 'Tuliskan rumus batas bawah (Q₁ − 1.5·IQR) dan batas atas (Q₃ + 1.5·IQR)...',
        },
      ],
    },
    agent3: {
      agentRole: 'agent3',
      title: 'Pengambilan Keputusan Bisnis Berbasis Data',
      roleName: 'Si Pembuat Rencana',
      roleNickname: 'Agen 3',
      tagline: 'Kapten Tim & Analis Bisnis',
      instructions: 'Interpretasikan hasil statistik dan rumuskan keputusan strategis pengalokasian anggaran pemasaran.',
      questions: [
        {
          id: 'a3_q1',
          type: 'short',
          prompt: 'Jika simpangan baku data kecil (σ < 2), apa kesimpulan tentang stabilitas omzet harian startup tersebut?',
          placeholder: 'Contoh: Omzet harian sangat stabil dan konsisten',
          correctAnswer: 'sangat stabil dan konsisten',
        },
        {
          id: 'a3_q2',
          type: 'checkbox',
          prompt: 'Indikator statistik manakah yang wajib dicantumkan dalam laporan eksekutif bulanan? (Pilih semua yang tepat)',
          options: [
            'Rata-rata penjualan harian (x̄)',
            'Nilai simpangan baku atau standar deviasi (σ)',
            'Rentang interkuartil (IQR) dan persentil 90%',
            'Warna background laptop analis data',
          ],
          correctAnswer: [
            'Rata-rata penjualan harian (x̄)',
            'Nilai simpangan baku atau standar deviasi (σ)',
            'Rentang interkuartil (IQR) dan persentil 90%',
          ],
        },
        {
          id: 'a3_q3',
          type: 'essay',
          prompt: 'Rangkum kesimpulan akhir kelompok mengenai bagaimana analisis statistika membantu perusahaan mengambil keputusan rasional bebas dari prasangka (bias)!',
          placeholder: 'Tuliskan kesimpulan terpadu kru data analyst...',
        },
      ],
    },
    agent4: {
      agentRole: 'agent4',
      title: 'Visualisasi Histogram & Diagram Boxplot',
      roleName: 'Si Pembawa Cerita',
      roleNickname: 'Agen 4',
      tagline: 'Ahli Visualisasi Data & Diagram',
      instructions: 'Rancang grafik histogram frekuensi dan diagram lima serangkai (Box-and-Whisker Plot).',
      questions: [
        {
          id: 'a4_q1',
          type: 'short',
          prompt: 'Sebutkan 5 nilai statistik utama yang dibutuhkan untuk menyusun diagram Boxplot!',
          placeholder: 'Contoh: Minimum, Q₁, Median, Q₃, Maksimum',
          correctAnswer: 'Minimum, Q₁, Median, Q₃, Maksimum',
        },
        {
          id: 'a4_q2',
          type: 'essay',
          prompt: 'Deskripsikan bagaimana bentuk diagram Boxplot dapat menunjukkan apakah distribusi data simetris atau miring (skewed)!',
          placeholder: 'Jelaskan posisi garis median di dalam kotak dan panjang kumis (whisker)...',
        },
      ],
    },
    agent5: {
      agentRole: 'agent5',
      title: 'Audit Presisi & Integritas Metodologi',
      roleName: 'Si Penjaga Kualitas',
      roleNickname: 'Agen 5',
      tagline: 'Ahli Validasi Data & Metodologi',
      instructions: 'Pastikan metode pembagian sampel data benar dan tidak ada kesalahan penulisan simbol statistik.',
      questions: [
        {
          id: 'a5_q1',
          type: 'checkbox',
          prompt: 'Checklist Integritas Data Statistik (Centang yang sudah dipastikan):',
          options: [
            'Data telah diurutkan dengan benar sebelum menentukan kuartil',
            'Rumus mean membagi total sigma dengan jumlah total sampel n',
            'Perhitungan ragam menggunakan pembagi (n − 1) untuk sampel',
            'Seluruh anggota tim telah memvalidasi interpretasi data',
          ],
          correctAnswer: [
            'Data telah diurutkan dengan benar sebelum menentukan kuartil',
            'Rumus mean membagi total sigma dengan jumlah total sampel n',
            'Perhitungan ragam menggunakan pembagi (n − 1) untuk sampel',
            'Seluruh anggota tim telah memvalidasi interpretasi data',
          ],
        },
      ],
    },
  },
  createdAt: new Date().toISOString(),
};

export const defaultMathTemplates: LkmConfig[] = [templateMat3, templateTrig4, templateStat5];
