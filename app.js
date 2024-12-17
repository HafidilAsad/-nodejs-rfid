const net = require("net");
const dotenv = require('dotenv');
const axios = require('axios');
const datas_location = require("./data/location");

dotenv.config();

const port_hf = process.env.PORT_HF;
const server_url = process.env.SERVER_URL;



// Fungsi untuk memposting data ke server
const postDataToServer = async (rfidHost, host) => {
  try {

    const formData = new FormData();
    
   
    formData.append('rfid_tag', rfidHost);
    formData.append('ipaddress', host);
    
   
    const response = await axios.post(server_url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' 
      }
    });
    
    console.log("Data posted to server:", response.data);
  } catch (error) {
    console.error(`Error posting data to server rfid:${rfidHost}, ip:${host}`, error.message);
  }
};

// Fungsi untuk membuat koneksi untuk setiap lokasi
const connectToLocation = (locationData) => {
  const { host, location } = locationData;

  const client = new net.Socket();

  client.connect(port_hf, host, () => {
    console.log(`Connected to ${host}:${port_hf} (${location})`)

    // Kirim heartbeat setiap 30 detik
    // setInterval(() => {
    //   client.write("Heartbeat");
    // }, 30000);
  });

  // Tangani data yang diterima
  client.on("data", (data) => {
    try {
      const startChar = String.fromCharCode(data[0]); // Karakter pertama
      const endChar = String.fromCharCode(data[data.length - 1]); // Karakter terakhir
      
      // Potong simbol awal & akhir, konversi ke string
      const hexString = data.slice(1, -2).toString(); 
      
      // Konversi hex ke string desimal
      const decimalValue = BigInt(`0x${hexString}`).toString(); 
  
      // Tambahkan nol di depan jika panjangnya kurang dari 10
      const rfidHost = decimalValue.padStart(10, '0');
      console.log(`Data RFID (${location})`, `${startChar}${rfidHost}${endChar}`);
  
      // Post data ke server
      postDataToServer(rfidHost, host);
    } catch (err) {
      console.error(`Error processing data (${location}): ${err.message}`);
    }
  });
  
  

  // Tangani koneksi yang ditutup
  client.on("close", () => {
    console.log(`Connection closed for ${host} (${location})`);
  });

  // Tangani error
  client.on("error", (err) => {
    console.error(`Error for ${host} (${location})`, err.message)
    setTimeout(() => {
      process.exit(1);
    }, 5*1000);
   
  });
};

// Buat koneksi untuk setiap lokasi     
datas_location.forEach((locationData) => {
  connectToLocation(locationData);
});