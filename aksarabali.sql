CREATE DATABASE aksarabali CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aksarabali;

CREATE TABLE aksara_bali (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    aksara_bali VARCHAR(10) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    latin VARCHAR(50) NOT NULL,
    unicode_aksara VARCHAR(20) NOT NULL,
    contoh_penggunaan TEXT,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT * FROM aksara_bali;





INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Aksara ha', 'ᬳ', 'Aksara Wianjana', 'ha', 'U+1B33', 'ᬳᬦ (hana)', ''),
    ('Aksara na', 'ᬦ', 'Aksara Wianjana', 'na', 'U+1B26', 'ᬦᬫ (nama)', ''),
    ('Aksara ca', 'ᬘ', 'Aksara Wianjana', 'ca', 'U+1B18', 'ᬘᬦ᭄ᬤ᭄ᬭ (candra)', ''),
    ('Aksara ra', 'ᬭ', 'Aksara Wianjana', 'ra', 'U+1B2D', 'ᬭᬫ (rama)', ''),
    ('Aksara ka', 'ᬓ', 'Aksara Wianjana', 'ka', 'U+1B13', 'ᬓᬮᬶ (kali)', ''),
    ('Aksara da', 'ᬤ', 'Aksara Wianjana', 'da', 'U+1B24', 'ᬤᬦ (dana)', ''),
    ('Aksara ta', 'ᬢ', 'Aksara Wianjana', 'ta', 'U+1B22', 'ᬢᬦᬄ (tanah)', ''),
    ('Aksara sa', 'ᬲ', 'Aksara Wianjana', 'sa', 'U+1B32', 'ᬲᬓ᭄ᬢᬶ (sakti)', ''),
    ('Aksara wa', 'ᬯ', 'Aksara Wianjana', 'wa', 'U+1B2F', 'ᬯᬳᬶᬦᬶ (wahini)', ''),
    ('Aksara la', 'ᬮ', 'Aksara Wianjana', 'la', 'U+1B2E', 'ᬮᬩᬸᬳᬦ᭄ (labuhan)', ''),
    ('Aksara ma', 'ᬫ', 'Aksara Wianjana', 'ma', 'U+1B2B', 'ᬫᬦᬸᬲ (manusa)', ''),
    ('Aksara ga', 'ᬕ', 'Aksara Wianjana', 'ga', 'U+1B15', 'ᬕᬤ (gada)', ''),
    ('Aksara ba', 'ᬩ', 'Aksara Wianjana', 'ba', 'U+1B29', 'ᬩᬮᬶ (bali)', ''),
    ('Aksara nga', 'ᬗ', 'Aksara Wianjana', 'nga', 'U+1B17', 'ᬗᬭᬦ᭄ (ngaran)', ''),
    ('Aksara pa', 'ᬧ', 'Aksara Wianjana', 'pa', 'U+1B27', 'ᬧᬦ᭄ᬤᬶᬢ (pandita)', ''),
    ('Aksara ja', 'ᬚ', 'Aksara Wianjana', 'ja', 'U+1B1A', 'ᬚᬕᬢ᭄ (jagat)', ''),
    ('Aksara ya', 'ᬬ', 'Aksara Wianjana', 'ya', 'U+1B2C', 'ᬬᬚ᭄ᬜ (yajna)', ''),
    ('Aksara nya', 'ᬜ', 'Aksara Wianjana', 'nya', 'U+1B1C', 'ᬜᬫᬦ᭄ (nyaman)', '');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Gantungan ha', '᭄ᬳ', 'Gantungan', 'ha', 'U+1B33', 'ᬦ᭄ᬳᬭᬸ (nhanru)', ''),
    ('Gantungan na', '᭄ᬦ', 'Gantungan', 'na', 'U+1B26', 'ᬳᬭ᭄ᬦᬸᬓ᭄ (Arnak)', ''),
    ('Gantungan ca', '᭄ᬘ', 'Gantungan', 'ca', 'U+1B18', 'ᬲᬶᬘ᭄ᬘ (sicca)', ''),
    ('Gantungan ra', '᭄ᬭ', 'Gantungan', 'ra', 'U+1B2D', 'ᬯᬶᬓ᭄ᬭ (Wikra)', ''),
    ('Gantungan ka', '᭄ᬓ', 'Gantungan', 'ka', 'U+1B13', 'ᬲᬓ᭄ᬓ (sakka)', ''),
    ('Gantungan da', '᭄ᬤ', 'Gantungan', 'da', 'U+1B24', 'ᬦ᭄ᬤᬫ (ndama)', ''),
    ('Gantungan ta', '᭄ᬢ', 'Gantungan', 'ta', 'U+1B22', 'ᬫᬦ᭄ᬢ (Manta)', ''),
    
    ('Gempelan sa', '᭄ᬲ', 'Gempelan', 'sa', 'U+1B32', 'ᬦᬧ᭄ᬲ (Napsa)', ''),
    
    ('Gantungan wa', '᭄ᬯ', 'Gantungan', 'wa', 'U+1B2F', 'ᬧᬤ᭄ᬯ (padwa)', ''),
    ('Gantungan la', '᭄ᬮ', 'Gantungan', 'la', 'U+1B2E', 'ᬲᬢ᭄ᬮ (satla)', ''),
    ('Gantungan ma', '᭄ᬫ', 'Gantungan', 'ma', 'U+1B2B', 'ᬅᬢ᭄ᬫ (Atma)', ''),
    ('Gantungan ga', '᭄ᬕ', 'Gantungan', 'ga', 'U+1B15', 'ᬩᭀᬤ᭄ᬕ (Bodga)', ''),
    ('Gantungan ba', '᭄ᬩ', 'Gantungan', 'ba', 'U+1B29', 'ᬲᬫ᭄ᬩ (Samba)', ''),
    ('Gantungan nga', '᭄ᬗ', 'Gantungan', 'nga', 'U+1B17', 'ᬲᬤ᭄ᬗ (sadnga)', ''),
    
    ('Gempelan pa', '᭄ᬧ', 'Gempelan', 'pa', 'U+1B27', 'ᬲᬫ᭄ᬧᬢ᭄ (sampat)', ''),
    
    ('Gantungan ja', '᭄ᬚ', 'Gantungan', 'ja', 'U+1B1A', 'ᬦᬚ᭄ᬚ (najja)', ''),
    ('Gantungan ya', '᭄ᬬ', 'Gantungan', 'ya', 'U+1B2C', 'ᬲᬢ᭄ᬬ (satya)', ''),
    ('Gantungan nya', '᭄ᬜ', 'Gantungan', 'nya', 'U+1B1C', 'ᬜᬤ᭄ᬜ (Nyadnya)', '');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Na rambat', 'ᬡ', 'Aksara Swalalita', 'na', 'U+1B21', 'ᬡᬶᬭ (nira)', 'Konsonan "na" melambangkan bunyi sengau langit-langit belakang.'),
    ('Da madu', 'ᬥ', 'Aksara Swalalita', 'da', 'U+1B19', 'ᬙᬸᬂ (duṅg)', 'Konsonan "da" dengan suara letup, mirip j.'),
    ('Ta latik', 'ᬝ', 'Aksara Swalalita', 'ta', 'U+1B1D', 'ᬝᬦ (tana)', 'Konsonan ta retrofleks, digunakan dalam kata-kata sastra.'),
    ('Ta tawa', 'ᬣ', 'Aksara Swalalita', 'ta', 'U+1B23', 'ᬣᬦ (tana)', 'Konsonan ta dental, umum dipakai dalam percakapan.'),
    ('Sa sapa', 'ᬱ', 'Aksara Swalalita', 'sa', 'U+1B31', 'ᬱᬭ (sara)', 'Konsonan sa palatal, biasa untuk kata Sanskerta.'),
    ('Sa saga', 'ᬰ', 'Aksara Swalalita', 'sa', 'U+1B30', 'ᬰᬶᬦ (sina)', 'Konsonan sa dental, bentuk lain dari "sa sapa".'),
    ('Ga gora', 'ᬖ', 'Aksara Swalalita', 'ga', 'U+1B16', 'ᬖᬭ (gara)', 'Konsonan ga bersuara, digunakan dalam kata-kata umum.'),
    ('Ba kembang', 'ᬪ', 'Aksara Swalalita', 'ba', 'U+1B2A', 'ᬪᬦ (bana)', 'Konsonan ba, sering digunakan dalam kata benda.'),
    ('Pa kapal', 'ᬨ', 'Aksara Swalalita', 'pa', 'U+1B28', 'ᬨᬸᬭ (pura)', 'Konsonan pa, digunakan dalam kata-kata sehari-hari.'),
    ('Kha', 'ᬔ', 'Aksara Swalalita', 'kha', 'U+1B14', 'ᬔᬸᬭ (khura)', 'Konsonan aspirasi kha, berasal dari Sanskerta.'),
    ('Ca laca', 'ᬙ', 'Aksara Swalalita', 'ca', 'U+1B19', 'ᬙᬸᬃ (cur)', 'Konsonan ca, digunakan dalam kata berakar Sanskerta.'),
    ('Ja jera', 'ᬛ', 'Aksara Swalalita', 'ja', 'U+1B1B', 'ᬛᬦ (jana)', 'Konsonan ja, melambangkan bunyi letup bersuara.');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Ulu', 'ᬶ', 'Pengangge Suara', '-i', 'U+1B36', 'ᬕᬶᬢ (gīta)', 'Tanda vokal i, diletakkan di atas aksara'),
    ('Suku', 'ᬸ', 'Pengangge Suara', '-u', 'U+1B38', 'ᬧᬸᬱ᭄ᬧ (puṣpa)', 'Tanda vokal u, diletakkan di bawah aksara'),
    ('Taling', 'ᬾ', 'Pengangge Suara', '-e', 'U+1B3E', 'ᬯᬾᬱ᭄ᬬ (weṣya)', 'Tanda vokal e, diletakkan di atas aksara'),
    ('Taling Tedong', 'ᭀ', 'Pengangge Suara', '-o', 'U+1B40', 'ᬰᭀᬘ (śoca)', 'Tanda vokal o, kombinasi huruf ha dan taling (e)'),
    ('Pepet', 'ᭂ', 'Pengangge Suara', '-ě', 'U+1B42', 'ᬲᭂᬯᬓ (sěwaka)', 'Tanda vocal -ě, diletakkan di atas aksara');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Cecek', 'ᬂ', 'Pengangge Tengenan', '-ng', 'U+1B02', 'ᬓᬂ (Kang)', 'bunyi ng di akhir suku kata'),
    ('Surang', 'ᬃ', 'Pengangge Tengenan', '-r', 'U+1B03', 'ᬓᬃ (Kar)', 'bunyi r di akhir suku kata'),
    ('Bisah', 'ᬄ', 'Pengangge Tengenan', '-h', 'U+1B04', 'ᬓᬄ (Kah)', 'bunyi h di akhir suku kata'),
    ('Adeg-adeg', '᭄', 'Pengangge Tengenan', 'Pemati', 'U+1B44', 'ᬓ᭄ (K)', 'menghilangkan vokal a dari aksara dasar');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Akara', 'ᬅ', 'Aksara Suara', 'a', 'U+1B05', 'ᬅᬓᬵᬰ (akasa)', 'Vokal dasar untuk bunyi /a/'),
    ('Ikara', 'ᬇ', 'Aksara Suara', 'i', 'U+1B07', 'ᬇᬦ᭄ᬤ᭄ᬭ (indra)', 'Vokal dasar untuk bunyi /i/'),
    ('Ukara', 'ᬉ', 'Aksara Suara', 'u', 'U+1B09', 'ᬉᬫ (uma)', 'Vokal dasar untuk bunyi /u/'),
    ('Ekara', 'ᬏ', 'Aksara Suara', 'e', 'U+1B0F', 'ᬏᬓ (eka)', 'Vokal dasar untuk bunyi /e/'),
    ('Okara', 'ᬑ', 'Aksara Suara', 'o', 'U+1B11', 'ᬑᬫ᭄ᬓᬵᬭ (omkara)', 'Vokal dasar untuk bunyi /o/'),
    ('Ra repa', 'ᬋ', 'Aksara Suara', 're', 'U+1B0B', 'ᬋᬓ᭄ᬱ (Reksa)', 'Bentuk khusus ra berbunyi /re/'),
    ('La lenga', 'ᬍ', 'Aksara Suara', 'le', 'U+1B0D', 'ᬍᬫᬄ (Lemah)', 'Bentuk khusus la dengan vokal panjang berbunyi /le/');
    
INSERT INTO aksara_bali (nama, aksara_bali, kategori, latin, unicode_aksara, contoh_penggunaan, deskripsi)
VALUES
    ('Nol', '᭐', 'Angka Bali', '0', 'U+1B50', '', 'Angka nol'),
    ('Sa', '᭑', 'Angka Bali', '1', 'U+1B51', '', 'Angka satu'),
    ('Dua', '᭒', 'Angka Bali', '2', 'U+1B52', '', 'Angka dua'),
    ('Telu', '᭓', 'Angka Bali', '3', 'U+1B53', '', 'Angka tiga'),
    ('Papat', '᭔', 'Angka Bali', '4', 'U+1B54', '', 'Angka empat'),
    ('Lima', '᭕', 'Angka Bali', '5', 'U+1B55', '', 'Angka lima'),
    ('Nem', '᭖', 'Angka Bali', '6', 'U+1B56', '', 'Angka enam'),
    ('Pitu', '᭗', 'Angka Bali', '7', 'U+1B57', '', 'Angka tujuh'),
    ('Kutus', '᭘', 'Angka Bali', '8', 'U+1B58', '', 'Angka delapan'),
    ('Sia', '᭙', 'Angka Bali', '9', 'U+1B59', '', 'Angka sembilan');

DROP DATABASE aksarabali;
DROP TABLE aksara_bali;
DELETE FROM aksara_bali;