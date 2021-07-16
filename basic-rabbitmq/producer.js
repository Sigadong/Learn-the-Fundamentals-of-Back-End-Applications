const amqp = require('amqplib');
// Karena proses transaksi dengan protokol AMQP dilakukan secara asynchronous
const init = async () => {
  // Membuat koneksi terlebih dahulu pada server RabbitMQ yg sudah dipasang di komputer lokal.
  const connection = await amqp.connect('amqp://localhost');
  // Membuat objek channel yg digunakan untuk memanggil API dalam mengoperasikan transaksi di protokol AMQP.
  const channel = await connection.createChannel();

  // menentukan dahulu nama dari queue yg dituju dan isi dari pesannya.
  const queue = 'dicoding';
  const message = 'Selamat belajar message broker sampai paham!';

  // channel.assertQueue bersifat idempoten, yg berarti ia hanya akan membuat channel baru bila channel yg diperiksa tidak ada.
  // Properti durable pada options berfungsi untuk menjaga agar queue tetap tersedia ketika server message broker restart.
  await channel.assertQueue(queue, {
    durable: true,
  });

  // Setelah memastikan queue tersedia, barulah kita bisa mengirimkan pesan dengan perintah channel.sendToQueue
  // Fungsi sendToQueue menerima dua parameter, yaitu nama queue dan pesan dalam bentuk Buffer
  await channel.sendToQueue(queue, Buffer.from(message));
  console.log('Pesan berhasil terkirim!');

  // Best practice ketika selesai mengirimkan pesan ke broker adalah tutup koneksi yang sebelumnya dibuat. Beri jeda minimal 1 detik setelah pengiriman pesan guna menghindari celah waktu dalam pengiriman.
  setTimeout(() => {
    connection.close();
  }, 1000);
};

init();