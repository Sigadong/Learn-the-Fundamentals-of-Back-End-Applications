const amqp = require('amqplib');

const init = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  const queue = 'dicoding';

  await channel.assertQueue(queue, {
    durable: true,
  });

  channel.consume(queue, (message) => {
    console.log(`Menerima pesan dari queue ${queue}: ${message.content.toString()}`);
  }, { noAck: true });

};

init();

/*
Fungsi CONSUME menerima tiga parameter, berikut penjelasan singkatnya:

 - Queue: Nama dari queue yang dikonsumsi. Consumer akan selalu mengamati untuk menerima pesan masuk yang dikirimkan ke queue tersebut.
 - Callback function: Fungsi yang akan dijalankan ketika ada pesan masuk ke dalam queue yang diamati. Fungsi ini membawa pesan berupa instance dari amqp.ConsumeMessage yang berisikan konten yang dikirim oleh producer. Kita dapat membaca kontennya dalam bentuk string dengan menggunakan fungsi message.content.toString().
 - Options: Objek yang menentukan seperti apa perilaku ketika pesan diterima. Salah satu properti objeknya adalah noAck, yang menunjukkan apakah penerimaan pesan butuh pengakuan (acknowledgement) atau tidak.
*/