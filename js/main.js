// Firebase Configuration (Replace with your config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const createCurrencyForm = document.getElementById('currencyForm');
const currencyList = document.getElementById('currencyList');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');

// Show Toast Notification
function showToast(message) {
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Create Currency
createCurrencyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const currencyName = document.getElementById('currencyName').value;
  const currencySymbol = document.getElementById('currencySymbol').value;
  const totalSupply = document.getElementById('totalSupply').value;
  const currencyImage = document.getElementById('currencyImage').files[0];

  // Show loading spinner
  loadingSpinner.classList.remove('hidden');

  // Upload image to Firebase Storage
  const storageRef = storage.ref(`currency-images/${currencyImage.name}`);
  storageRef.put(currencyImage).then((snapshot) => {
    snapshot.ref.getDownloadURL().then((downloadURL) => {
      // Save currency data to Firestore
      db.collection('currencies').add({
        name: currencyName,
        symbol: currencySymbol,
        supply: totalSupply,
        image: downloadURL,
      }).then(() => {
        showToast('Currency created successfully!');
        loadingSpinner.classList.add('hidden');
        createCurrencyForm.reset(); // Reset the form
      }).catch((error) => {
        showToast('Error creating currency: ' + error.message);
        loadingSpinner.classList.add('hidden');
      });
    });
  }).catch((error) => {
    showToast('Error uploading image: ' + error.message);
    loadingSpinner.classList.add('hidden');
  });
});

// Load Public Currencies (Real-Time Updates)
db.collection('currencies').onSnapshot((querySnapshot) => {
  currencyList.innerHTML = ''; // Clear the list
  querySnapshot.forEach((doc) => {
    const currency = doc.data();
    const currencyItem = document.createElement('div');
    currencyItem.classList.add('currency-item');
    currencyItem.innerHTML = `
      <strong>${currency.name} (${currency.symbol})</strong><br>
      Total Supply: ${currency.supply}<br>
      <img src="${currency.image}" alt="${currency.name}">
    `;
    currencyList.appendChild(currencyItem);
  });
});