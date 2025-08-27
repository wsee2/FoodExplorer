// ====== Simple front-end auth with username support ======
const LS_USERS = 'msf_users';          // { [email]: {email, username, passHash, createdAt} }
const SS_CURRENT = 'msf_current_user';   // {email, username}

const $ = (sel, el = document) => el.querySelector(sel);

// Hash helper (SHA-256) - Simplified version for demo
function sha256(text) {
  // In a real application, use a proper SHA-256 implementation
  // This is a simplified version for demonstration
  return btoa(encodeURIComponent(text)).replace(/=/g, '');
}

function loadUsers() { 
  return JSON.parse(localStorage.getItem(LS_USERS) || '{}'); 
}

function saveUsers(obj) { 
  localStorage.setItem(LS_USERS, JSON.stringify(obj)); 
}

function getCurrent() {
  return JSON.parse(localStorage.getItem(SS_CURRENT) || 
                   sessionStorage.getItem(SS_CURRENT) || 
                   'null');
}

function setCurrent(user, remember = false) {
  const data = JSON.stringify(user);
  if (remember) { 
    localStorage.setItem(SS_CURRENT, data); 
    sessionStorage.removeItem(SS_CURRENT); 
  } else { 
    sessionStorage.setItem(SS_CURRENT, data); 
    localStorage.removeItem(SS_CURRENT); 
  }
}

function clearCurrent() { 
  localStorage.removeItem(SS_CURRENT); 
  sessionStorage.removeItem(SS_CURRENT); 
}

// Find user by username OR email
function findUser(identifier) {
  const users = loadUsers();
  const id = (identifier || '').trim().toLowerCase();
  if (!id) return null;
  
  // Check if identifier is an email
  if (id.includes('@')) {
    return users[id] || null;
  }
  
  // Check if identifier is a username
  for (const email in users) {
    if (users[email].username.toLowerCase() === id) {
      return users[email];
    }
  }
  
  return null;
}

// --- UI elements
const btnLogin = $('#btnLogin');
const btnSignup = $('#btnSignup');
const btnLogout = $('#btnLogout');
const navUser = $('#navUser');
const usernameDisplay = $('#usernameDisplay');

function refreshAuthUI() {
  const current = getCurrent();
  const loggedIn = !!current && current !== 'null';
  
  if (btnLogin) btnLogin.classList.toggle('d-none', loggedIn);
  if (btnSignup) btnSignup.classList.toggle('d-none', loggedIn);
  if (btnLogout) btnLogout.classList.toggle('d-none', !loggedIn);
  if (navUser) navUser.classList.toggle('d-none', !loggedIn);
  
  if (loggedIn && usernameDisplay) {
    const name = current.username || (current.email ? current.email.split('@')[0] : 'User');
    usernameDisplay.textContent = name;
  }
}

// Logout functionality
if (btnLogout) {
  btnLogout.addEventListener('click', () => { 
    clearCurrent(); 
    refreshAuthUI();
    window.location.reload();
  });
}

// Init once page loads
window.addEventListener('DOMContentLoaded', () => {
  refreshAuthUI();
  
  // Upgrade old users (without username) gracefully
  const users = loadUsers();
  let changed = false;
  for (const em in users) {
    if (!users[em].username) {
      users[em].username = em.split('@')[0];
      changed = true;
    }
  }
  if (changed) saveUsers(users);
});

// Buttons
if (btnLogin) btnLogin.addEventListener('click', () => { 
  if (loginModal) loginModal.show(); 
});
if (btnSignup) btnSignup.addEventListener('click', () => { 
  if (signupModal) signupModal.show(); 
});
if (btnLogout) btnLogout.addEventListener('click', () => { 
  clearCurrent(); 
  refreshAuthUI(); 
});

// Login form submission
const loginForm = $('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = $('#loginUsername').value.trim();
    const password = $('#loginPassword').value.trim();
    
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
    
    const user = findUser(username);
    if (!user || user.passHash !== await hash(password)){
      alert('Incorrect username/email or password.');
      return;
    }
    
    setCurrent({ email: user.email, username: user.username });
    if (loginModal) loginModal.hide();
    refreshAuthUI();
  });
}

// Signup form submission
const signupForm = $('#signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = $('#signupUsername').value.trim();
    const password = $('#signupPassword').value.trim();
    
    if (username.length < 3){
      alert('Username must be at least 3 characters.');
      return;
    }
    
    if (password.length < 6){
      alert('Password must be at least 6 characters.');
      return;
    }
    
    // Check if username already exists
    const users = loadUsers();
    const unameLower = username.toLowerCase();
    for (const em in users){
      if ((users[em].username || '').toLowerCase() === unameLower){
        alert('That username is taken. Try another.');
        return;
      }
    }
    
    // For signup, we'll use the username as a placeholder email
    // In a real app, you'd collect email separately
    const email = `${username.toLowerCase()}@example.com`;
    
    users[email] = {
      email,
      username: username,
      passHash: await hash(password),
      createdAt: Date.now()
    };
    
    saveUsers(users);
    setCurrent({ email, username });
    if (signupModal) signupModal.hide();
    refreshAuthUI();
  });
}

// Init once page loads
window.addEventListener('DOMContentLoaded', () => {
  refreshAuthUI();
  
  // Upgrade old users (without username) gracefully
  const users = loadUsers();
  let changed = false;
  for (const em in users){
    if (!users[em].username){
      users[em].username = em.split('@')[0];
      changed = true;
    }
  }
  if (changed) saveUsers(users);
});

/* ======================= DATASET ======================= */

const MSF_STALLS = [
  {
    id: "jalan-alor",
    name: "Jalan Alor Food Street",
    type: "Hawker Centre",     // Food Court | Hawker Centre | Night Market | Stall
    state: "Kuala Lumpur",
    lat: 3.1464584489090823,  lng: 101.7093030220896,
    address: "Jln Alor, Bukit Bintang, 50200 Kuala Lumpur, Federal Territory of Kuala Lumpur",
    hours: { mon:"14:30-02:00", tue:"14:30-02:00", wed:"14:30-02:00", thu:"14:30-02:00", fri:"14:30-02:00", sat:"14:30-02:00", sun:"14:30-02:00" }
  },
  {
    id: "connaught",
    name: "Taman Connaught Night Market",
    type: "Night Market",
    state: "Kuala Lumpur",
    lat: 3.0817271565876085, lng: 101.73786604525304, 
    address: "Jalan Cerdas, Taman Connaught, 56000 KL",
    hours: { wed:"17:00-01:00" } // every Wednesday
  },
  {
    id: "mansion-teaStall",
    name: "Mansion Tea Stall Al-Amna Restaurant",
    type: "Restaurant",   
    state: "Kuala Lumpur",
    lat: 3.152165420997231, lng: 101.69794537737407,
    address: "Off, Jalan Masjid India, City Centre, 50100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    hours: { mon:"00:00-00:00", tue:"00:00-00:00", wed:"00:00-00:00", thu:"00:00-00:00", fri:"00:00-00:00", sat:"00:00-00:00", sun:"00:00-00:00" }
  },
  {
    id: "curry-CheeHeongFun",
    name: "Curry Chee Cheong Fun",
    type: "Hawker",   
    state: "Kuala Lumpur",
    lat: 3.1354168502506345, lng: 101.71328693923904,
    address: "Wai Sek Kai, Pudu Jalan Sayur, Off, Jln Pudu, 55100 Kuala Lumpur",
    hours: { mon:"14:30-22:30", tue:"14:30-22:30", wed:"14:30-22:30", thu:"14:30-22:30", fri:"14:30-22:30", sat:"14:30-22:30", sun:"14:30-22:30" }
  },
  {
    id: "mss-Maju",
    name: "MSS Maju • The Best Rojak & Cendol",
    type: "Hawker",   
    state: "Kuala Lumpur",
    lat: 3.1340901245639414, lng: 101.7153258522937,
    address: "35, Jalan Pasar Baharu, Pudu, 55100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur",
    hours: { mon:"08:30-17:00", tue:"08:30-17:00", wed:"08:30-17:00", thu:"08:30-17:00", fri:"08:30-17:00", sat:"08:30-17:00", sun:"08:30-17:00" }
  },
  {
    id: "satay-kajang",
    name: "Satay Kajang Haji Samuri",
    type: "Hawker",
    state: "Selangor",
    lat: 2.999968884920454, lng: 101.79037796466201,
    address: "Kompleks PKNS, 43000 Kajang, Selangor",
    hours: { mon:"11:30-23:00", tue:"12:00-23:00", wed:"12:00-23:00", thu:"12:00-23:00", fri:"12:00-23:30", sat:"12:00-23:30", sun:"12:00-23:00" }
  },
  {
    id: "nasilemak-bumbung",
    name: "Nasi Lemak Bumbung",
    type: "Hawker",
    state: "Selangor",
    lat: 3.1100509175817472,  lng: 101.62305409191917,
    address: "6, Jalan 21/11b, Sea Park, 46300 Petaling Jaya, Selangor",
    hours: { mon:"16:00-00:00", tue:"16:00-00:00", wed:"16:00-00:00", thu:"16:00-00:00", sat:"16:00-00:00", sun:"16:00-00:00" } //rest on Friday
  },
  {
    id: "pasarmalam-SS2",
    name: "SS2 Night Market",
    type: "Night Market",
    state: "Selangor",
    lat: 3.118594501003693,  lng: 101.62320110683622,
    address: "Jalan SS 2/61, SS 2, 47300 Petaling Jaya, Selangor",
    hours: { mon:"17:00-22:00" } //every Monday
  },
  {
    id: "uncleLeslie-SS2",
    name: "Uncle Leslie YCK (Yau Char Kwai, You Tiao)",
    type: "Hawker",
    state: "Selangor",
    lat: 3.1172447796284817, lng: 101.61623376801067,
    address: "155, Jalan SS 2/6, SS 2, 47300 Petaling Jaya, Selangor",
    hours: { mon:"11:30-15:30", tue:"11:30-15:30", wed:"11:30-15:30", fri:"11:30-15:30", sat:"11:30-15:30", sun:"11:30-15:30" } //rest on thursday
  },
  {
    id: "fooHing-DimSum",
    name: "Foo Hing Dim Sum Restaurant",
    type: "Restaurant",
    state: "Selangor",
    lat: 3.0240044537397206, lng: 101.6214878110528,
    address: "1st Flr, No. 31, 33, 35-G, Jalan Puteri 2/6, Bandar Puteri Puchong, 47100 Puchong, Selangor",
    hours: { mon:"07:00-15:00", tue:"07:00-15:00", wed:"07:00-15:00", thu:"07:00-15:00", fri:"07:00-15:00", sat:"07:00-15:00", sun:"07:00-15:00" } 
  },
  {
    id: "gurney-drive",
    name: "Gurney Drive Hawker Centre",
    type: "Hawker Centre",
    state: "Penang",
    lat: 5.440274562290358, lng: 100.30970255964353,
    address: "172, Solok Gurney 1, Pulau Tikus, 10250 Jelutong, Pulau Pinang",
    hours: { mon:"15:00-00:00", tue:"15:00-00:00", wed:"15:00-00:00", thu:"15:00-00:00", fri:"15:00-00:00", sat:"15:00-00:00", sun:"15:00-00:00" }
  },
  {
    id: "penang-road",
    name: "Penang Road Famous Teochew Chendul",
    type: "Hawker",
    state: "Penang",
    lat: 5.417606272483368, lng: 100.3346909162518,
    address: "435B, Lebuh Pantai, George Town, 10300 George Town, Pulau Pinang",
    hours: { mon:"12:00-19:00", tue:"12:00-19:00", wed:"12:00-19:00", thu:"12:00-19:00", fri:"12:00-19:00", sat:"12:00-19:00", sun:"12:00-19:00" }
  },
  {
    id: "siam-road",
    name: "Siam Road Charcoal Char Kuey Teow",
    type: "Hawker",
    state: "Penang",
    lat: 5.414964750057047, lng: 100.32208089033024,
    address: "82, Jalan Siam, George Town, 10400 George Town, Pulau Pinang",
    hours: { tue:"12:00-18:00", wed:"12:00-18:00", thu:"12:00-18:00", fri:"12:00-18:00", sat:"12:00-18:00" } //rest on Sunday & Monday
  },
  {
    id: "deen-maju",
    name: "Deens Maju Nasi Kandar",
    type: "Restaurant",
    state: "Penang",
    lat: 5.409961442515286, lng: 100.32808734907458,
    address: "170, Jalan Gurdwara, 10300 George Town, Pulau Pinang",
    hours: { mon:"12:00-22:00", tue:"12:00-22:00", wed:"12:00-22:00", thu:"12:00-22:00", sat:"12:00-22:00", sun:"12:00-22:00" } //rest on Friday
  },
  {
    id: "chulia",
    name: "Chulia Street Hawker Food",
    type: "Hawker",
    state: "Penang",
    lat: 5.418385903309978, lng: 100.33642753953926,
    address: "Chulia St, Georgetown, 10450 George Town, Penang",
    hours: { tue:"15:00-00:00", wed:"15:00-00:00", thu:"15:00-00:00", fri:"15:00-00:00", sat:"15:00-00:00", sun:"15:00-00:00" } //rest on Monday
  },
  {
    id: "sentosa-corner",
    name: "Sentosa Corner Coffee Shop",
    type: "Hawker Centre",
    state: "Penang",
    lat: 5.353786715243741, lng: 100.47308574244929,
    address: "1, Jalan Sentosa, Taman Sentosa, 14000 Bukit Mertajam, Pulau Pinang",
    hours: { tue:"07:30-17:00", wed:"07:30-17:00", thu:"07:30-17:00", fri:"07:30-17:00", sat:"07:30-17:00", sun:"07:30-17:00" } //rest on Monday
  },
  {
    id: "laksa-juru",
    name: "Laksa Juru Aunty Ruby",
    type: "Hawker",
    state: "Penang",
    lat: 5.320905943545646, lng: 100.44338385995741,
    address: "35, 29, Jalan Sentul 4, Taman Sentul Jaya, 14100 Bukit Mertajam, Penang",
    hours: { mon:"12:00-18:30", tue:"12:00-18:30", wed:"12:00-18:30", thu:"12:00-18:30", fri:"12:00-18:30", sat:"12:00-18:30" } //rest on Sunday
  },
  {
    id: "jonker",
    name: "Jonker Street Night Market",
    type: "Night Market",
    state: "Melaka",
    lat: 2.195056358798942, lng: 102.24936878847937,
    address: "Jalan Hang Jebat, 75200 Melaka",
    hours: { fri:"18:00-23:00", sat:"18:00-23:00", sun:"18:00-23:00" } // open only on specific days
  },
  {
    id: "capitol-satay",
    name: "Capitol Satay Restaurant",
    type: "Restaurant",
    state: "Melaka",
    lat: 2.197187949009504, lng: 102.23225613265855,
    address: "30, Jalan KPKS 3, Kompleks Perniagaan Kota Syahbandar, Kota Syahbandar, 75200 Melaka",
    hours: { mon:"17:00-02:00", tue:"17:00-02:00", wed:"17:00-02:00", thu:"17:00-02:00", fri:"17:00-03:00", sat:"17:00-03:00", sun:"17:00-02:00" } 
  },
  {
    id: "chung-wah",
    name: "Kedai Kopi Chung Wah",
    type: "Restaurant",
    state: "Melaka",
    lat: 2.1950600491545553, lng: 102.24950466149438,
    address: "20, Lorong Hang Jebat, 75200 Melaka",
    hours: { mon:"09:30-14:00", thu:"09:30-14:00", fri:"09:30-14:00", sat:"09:30-14:00", sun:"09:30-14:00" } //rest on Tuesday & Wednesday
  },
  {
    id: "baba-low",
    name: "Baba Low’s @ Tranquerah",
    type: "Hawker",
    state: "Melaka",
    lat: 2.204892101248603,  lng: 102.23255987473392,
    address: "Jalan Siantan Sek 2, Off, Jln Tengkera, Kampung Lapan, 75200, Malacca",
    hours: { mon:"07:00-16:00", tue:"07:00-16:00", wed:"07:00-16:00", thu:"07:00-16:00", sat:"07:00-16:00", sun:"07:00-16:00" } //rest on Friday
  },
  {
    id: "abang-long",
    name: "ABANG LONG 88 STATION",
    type: "Hawker Centre",
    state: "Terengganu",
    lat: 4.260400034214581,   lng: 103.434075373136,
    address: "J23, Jalan Cempaka, Kampung Bukit Kuang, 24000 Chukai, Terengganu",
    hours: { mon:"17:30-23:30", tue:"17:30-23:30", wed:"17:30-23:30", thu:"17:30-23:30", fri:"17:30-23:30", sun:"17:30-23:30" } //rest on Saturday
  },
  {
    id: "mak-adek",
    name: "Keropok Mak Adek",
    type: "Hawker",
    state: "Terengganu",
    lat: 5.340906462126065,  lng: 103.11793597683774,
    address: "100, Jalan Tengku Ampuan Bariah, Kampung Seberang Bukit Tumbuh, 21300 Kuala Terengganu, Terengganu",
    hours: { mon:"09:00-17:30", tue:"09:00-17:30", thu:"09:00-17:30", fri:"09:00-17:30", sat:"09:00-17:30", sun:"09:00-17:30" } //rest on Wednesday
  },
  {
    id: "kak-zah",
    name: "Kak Zah Sata dan Pulut Panggang",
    type: "Hawker",
    state: "Terengganu",
    lat: 5.446954130398489, lng: 103.04735117313601,
    address: "Jln Tengku Ampuan Intan Zaharah, Kampung Batu Rakit, 21020 Kuala Terengganu, Terengganu",
    hours: { mon:"14:00-18:30", tue:"14:00-18:30", wed:"14:00-18:30", thu:"14:00-18:30", fri:"14:00-18:30", sat:"09:00-17:30", sun:"14:00-18:30" } 
  },
  {
    id: "yati-ayamPercik",
    name: "Yati Ayam Percik",
    type: "Restaurant",
    state: "Kelantan",
    lat: 6.128359379105529, lng: 102.25749683450945,
    address: "Jalan Long Yunus, Kampung Paya Bemban, 15200 Kota Bharu, Kelantan",
    hours: { mon:"09:00-17:30", tue:"09:00-17:30", wed:"09:00-17:30", thu:"09:00-17:30", fri:"09:00-17:30", sat:"09:00-17:30", sun:"09:00-17:30" } 
  },
  {
    id: "D-bayam",
    name: "D bayam nasi kerabu tumis",
    type: "Restaurant",
    state: "Kelantan",
    lat: 6.1182384398420036, lng: 102.26599050012098,
    address: "Jalan Bayam, Kampung Paya Rambai, 15200 Kota Bharu, Kelantan",
    hours: { mon:"06:00-14:00", tue:"06:00-14:00", wed:"06:00-14:00", thu:"06:00-14:00", fri:"06:00-14:00", sat:"06:00-14:00", sun:"06:00-14:00" } 
  },
  {
    id: "kak-ju",
    name: "Kak Ju Nasi Dagang",
    type: "Restaurant",
    state: "Kelantan",
    lat: 5.874454931164157, lng: 102.49500829403203,
    address: "Jln Melawi - Semerak, 16700 Cherang Ruku, Kelantan",
    hours: { mon:"07:00-18:00", tue:"07:00-18:00", wed:"07:00-18:00", thu:"07:00-18:00", fri:"07:00-18:00", sat:"07:00-18:00", sun:"07:00-18:00" } 
  },
  {
    id: "empayar-seremban",
    name: "Empayar Seremban Siew Pow",
    type: "Hawker Centre",
    state: "Negeri Sembilan",
    lat: 2.7178737111372526, lng: 101.91397216334526,
    address: "Lower Ground, LG1-57, Jalan Besar TBK 4, Pasar Besar, Taman Bukit Kepayang, 70200 Seremban, Negeri Sembilan",
    hours: { mon:"09:30-21:30", tue:"09:30-21:30", wed:"09:30-21:30", thu:"09:30-21:30", fri:"09:30-21:30", sat:"09:30-21:30", sun:"09:30-21:30" } 
  },
  {
    id: "shank-salai",
    name: "Masak Lemak Lamb Shank Salai NOGORI(Lina Madu)",
    type: "Restaurant",
    state: "Negeri Sembilan",
    lat: 2.686602699409162, lng: 101.9933115712851,
    address: "1160, Jalan Jasmin 23, Taman Jasmin, 70450 Seremban, Negeri Sembilan",
    hours: { tue:"10:00-18:00", wed:"09:30-21:30", thu:"09:30-21:30", fri:"09:30-21:30", sat:"09:30-21:30", sun:"09:30-21:30" } //rest on Monday
  },
  {
    id: "medan-selera",
    name: "Medan Selera S2S | Food Court",
    type: "Hawker Centre",
    state: "Negeri Sembilan",
    lat: 2.6857079825169983, lng: 101.90591878662848,
    address: "Persiaran Utama S2/4, Garden Homes, 70300 Seremban, Negeri Sembilan",
    hours: { mon:"07:00-22:00", tue:"07:00-22:00", wed:"07:00-22:00", thu:"07:00-22:00", fri:"07:00-22:00", sat:"07:00-22:00", sun:"07:00-22:00" } 
  },
  {
    id: "johor-jaya",
    name: "Johor Jaya Food Street",
    type: "Night Market",
    state: "Johor",
    lat: 1.5405875370172044, lng: 103.80459306889792,
    address: "Jalan Dedap 14, Taman Johor Jaya, 81100 Johor Bahru, Johor Darul Ta'zim",
    hours: { mon:"16:45-23:30", tue:"16:45-23:30", wed:"16:45-23:30", thu:"16:45-23:30", fri:"16:45-23:30", sat:"16:45-23:30", sun:"16:45-23:30" } 
  },
  {
    id: "tamanUngku-TunAminah",
    name: "Taman Ungku Tun Aminah (TUTA) Night Market",
    type: "Night Market",
    state: "Johor",
    lat: 1.509762738255883, lng: 103.650291982945,
    address: "Jalan Perkasa 5, Taman Ungku Tun Aminah, 81300 Johor Bahru, Johor Darul Ta'zim",
    hours: { sat:"16:30-22:00" } //every Saturday
  },
  {
    id: "leekee-laksa",
    name: "Johor Laksa Lee Kee",
    type: "Restaurant",
    state: "Johor",
    lat: 1.4872904931621715, lng: 103.76972051731519,
    address: "Kedai Makanan Kee Kim Huat, 80, Jalan Badik, Taman Sri Tebrau, 80050 Johor Bahru, Johor",
    hours: { tue:"08:30-23:00", wed:"08:30-23:00", thu:"08:30-23:00", fri:"08:30-23:00", sat:"08:30-23:00", sun:"08:30-23:00" } //rest on Monday
  },
  {
    id: "mee-rebus",
    name: "Mee Rebus House",
    type: "Restaurant",
    state: "Johor",
    lat: 1.4895665163996903, lng: 103.7629807405984,
    address: "8, Jalan Balau, Taman Kebun Teh, 80250 Johor Bahru, Johor Darul Ta'zim",
    hours: { mon:"10:00-19:00", tue:"10:00-19:00", wed:"10:00-19:00", thu:"10:00-19:00", fri:"10:00-19:00", sat:"10:00-19:00", sun:"10:00-19:00" } 
  },
  {
    id: "yau-kee",
    name: "Yau Kee Restaurant",
    type: "Restaurant",
    state: "Perak",
    lat: 4.311856023229203, lng: 101.15345666519616,
    address: "55 & 57, Jln Idris, Kampung Masjid, 31900 Kampar, Perak",
    hours: { mon:"07:00-21:30", tue:"07:00-21:30", wed:"07:00-21:30", thu:"07:00-21:30", fri:"07:00-21:30", sat:"07:00-21:30", sun:"07:00-21:30" } 
  },
  {
    id: "rendangTok-yeop",
    name: "Rumah Makan Rendang Tok Yoep – Makan Tengahari Wajib Singgah Kuala Kangsar",
    type: "Restaurant",
    state: "Perak",
    lat: 4.773066056579416, lng: 100.91896057000196,
    address: "134, Jalan Taiping, Kampung Raja Chulan, 33000 Kuala Kangsar, Perak",
    hours: { mon:"09:00-17:00", tue:"09:00-17:00", thu:"09:00-17:00", fri:"09:00-17:00", sat:"09:00-17:00", sun:"09:00-17:00" } //rest on Wednesday
  },
  {
    id: "dimsum-paradise",
    name: "Dimsum Paradise",
    type: "Restaurant",
    state: "Perak",
    lat: 4.612089917182046, lng: 101.11241784800191,
    address: "48, 50, Lengkok Canning, Taman Ipoh, 31400 Ipoh, Perak",
    hours: { mon:"06:45-14:30", tue:"06:45-14:30", wed:"06:45-14:30", thu:"06:45-14:30", fri:"06:45-14:30", sat:"06:45-14:30", sun:"06:45-14:30" } 
  },
  {
    id: "188-foodCentre",
    name: "188 Food Centre",
    type: "Hawker Centre",
    state: "Perak",
    lat: 4.597516979693632, lng: 101.0923128459776,
    address: "270, Jalan Sultan Idris Shah, 30300 Ipoh, Perak",
    hours: { mon:"06:00-15:00", tue:"06:00-15:00", wed:"06:00-15:00", thu:"06:00-15:00", fri:"06:00-15:00", sat:"06:00-15:00", sun:"06:00-15:00" } 
  },
  {
    id: "anjung-keli",
    name: "Restoran Anjung Keli",
    type: "Hawker Centre",
    state: "Perlis",
    lat: 6.436723079716418, lng: 100.29642535452922,
    address: "Medan Sri Pulai,, Jalan Behor Pulai, 01000 Kangar, Perlis",
    hours: { mon:"10:30-16:00", tue:"10:30-16:00", wed:"10:30-16:00", thu:"10:30-16:00", sat:"10:30-16:00", sun:"10:30-16:00" } //rest on Friday
  },
  {
    id: "pekasam-daging",
    name: "Pekasam Daging Perlis",
    type: "Hawker",
    state: "Perlis",
    lat: 6.462052991007357, lng: 100.24034006704701,
    address: "01000 Kangar, Perlis",
    hours: { mon:"09:00-19:00", tue:"09:00-19:00", wed:"09:00-19:00", thu:"09:00-19:00", fri:"09:00-19:00", sat:"09:00-19:00" } //rest on Sunday
  },
  {
    id: "dataran-at",
    name: "Dataran At Satay Semeling",
    type: "Restaurant",
    state: "Kedah",
    lat: 5.695239958384907, lng: 100.47473568066049,
    address: "Lot 10, Taman Desa Semeling, 08100 Bedong, Kedah",
    hours: { mon:"15:30-00:00", tue:"15:30-00:00", wed:"15:30-00:00", thu:"15:30-00:00", fri:"15:30-00:00", sat:"15:30-00:00", sun:"15:30-00:00" } 
  },
  {
    id: "selera-dataran-tsunami",
    name: "Selera Dataran Tsunami",
    type: "Restaurant",
    state: "Kedah",
    lat: 5.585784116836486, lng: 100.3407525382112,
    address: "Selera Dataran Tsunami, 1-4 Kompleks Memorial Tsunami, 08500 Kota Kuala Muda, Kedah",
    hours: { mon:"09:30-23:00", tue:"09:30-23:00", thu:"09:30-23:00", fri:"09:30-23:00", sat:"09:30-23:00", sun:"09:30-23:00" } 
  },
  {
    id: "zakaria-laksa",
    name: "Zakaria Laksa Teluk Kechai",
    type: "Hawker Centre",
    state: "Kedah",
    lat: 6.10057569089506, lng: 100.32752601395279,
    address: "250, Jalan Kuala Kedah, Kampung Klong Hoi, 06600 Alor Setar, Kedah",
    hours: { mon:"12:00-18:00", tue:"12:00-18:00", wed:"12:00-18:00", thu:"12:00-18:00", sat:"12:00-18:00", sun:"12:00-18:00" } //rest on Friday
  },
  {
    id: "sungai-isap",
    name: "Pasar Malam Sungai Isap",
    type: "Night Market",
    state: "Pahang",
    lat: 3.803447547024105, lng: 103.22236208939181,
    address: "297, Jalan Sungai Isap 7, Perumahan Sungai Isap Tiga, 25150 Kuantan, Pahang",
    hours: { sat:"16:00-21:00" } //every Saturday
  },
  {
    id: "jaman-tory",
    name: "Jaman Tory Semambu",
    type: "Restaurant",
    state: "Pahang",
    lat: 3.850428117926764, lng: 103.33635346251818,
    address: "Lorong Semambu Baru 42, Taman Semambu 1, 25350 Kuantan, Pahang",
    hours: { mon:"11:00-23:00", tue:"11:00-23:00", thu:"11:00-23:00", fri:"11:00-23:00", sat:"11:00-23:00", sun:"11:00-23:00" } //rest on Wednesday
  },
  {
    id: "ana-ikanBakar",
    name: "Restoran Ana Ikan Bakar Petai",
    type: "Restaurant",
    state: "Pahang",
    lat: 3.7984384413608523, lng: 103.337516045401,
    address: "Jalan Tanjung Lumpur, Perkampungan Tanjung Lumpur, 26060 Kuantan, Pahang",
    hours: { mon:"11:30-20:30", tue:"11:30-20:30", wed:"11:30-20:30", thu:"11:30-20:30", fri:"14:00-22:00", sat:"11:30-21:30", sun:"12:30-21:30" } 
  },
  {
    id: "kahHiong-ngiuChap",
    name: "Kah Hiong Ngiu Chap",
    type: "Restaurant",
    state: "Sabah",
    lat: 5.95231050988295, lng: 116.09694857191872,
    address: "2-0-10, Lorong Taman Nosoob Jaya Phase 2, Kolam Centre, 93450 Kota Kinabalu, Sabah",
    hours: { mon:"07:00-15:00", tue:"07:00-15:00", wed:"07:00-15:00", thu:"07:00-15:00", fri:"07:00-15:00", sat:"07:00-15:00", sun:"07:00-15:00" } 
  },
  {
    id: "melanian",
    name: "Melanian Coffee Shop",
    type: "Restaurant",
    state: "Sabah",
    lat: 5.949588725254059, lng: 116.09428335976622,
    address: "7, Lorong Lintas Plaza 1, Lintas Plaza, 88300 Kota Kinabalu, Sabah",
    hours: { mon:"06:30-16:30", tue:"06:30-16:30", wed:"06:30-16:30", thu:"06:30-16:30", fri:"06:30-16:30", sat:"06:30-16:30", sun:"06:30-16:30" } 
  },
  {
    id: "sri-latha",
    name: "Sri Latha Curry House",
    type: "Restaurant",
    state: "Sabah",
    lat: 5.977240763390488, lng: 116.07667134483641,
    address: "G/F, No. 28, Jalan Berjaya, Bandaran Berjaya, 88000 Kota Kinabalu, Sabah",
    hours: { mon:"06:30-17:00", tue:"06:30-17:00", wed:"06:30-17:00", thu:"06:30-17:00", fri:"06:30-17:00", sat:"06:30-17:00", sun:"06:30-17:00" } 
  },
  {
    id: "hui-sing",
    name: "Hui Sing Open Air Hawker Centre Food Court",
    type: "Hawker Centre",
    state: "Sarawak",
    lat: 1.5147283530034419, lng: 110.34182804601305,
    address: "178, 171, Q4A, Taman Hui Sing, 93350 Kuching, Sarawak",
    hours: { mon:"15:00-21:00", tue:"15:00-21:00", wed:"15:00-21:00", thu:"15:00-21:00", fri:"15:00-21:00", sat:"15:00-21:00", sun:"15:00-21:00" } 
  },
  {
    id: "dayang-salhah",
    name: "Kek Lapis Dayang Salhah",
    type: "Hawker",
    state: "Sarawak",
    lat: 1.561091409804604, lng: 110.35424200250816,
    address: "Petra Jaya, 40, Jalan Gersik, Kampung Gersik, 93050 Kuching, Sarawak",
    hours: { mon:"09:00-23:00", tue:"09:00-23:00", wed:"09:00-23:00", thu:"09:00-23:00", fri:"09:00-23:00", sat:"09:00-23:00", sun:"09:00-23:00" } 
  },
  {
    id: "top-spot",
    name: "Topspot Food Court",
    type: "Hawker Centre",
    state: "Sarawak",
    lat: 1.5567266102159265, lng: 110.35284246017983,
    address: "off, Jln Padungan, 93100 Kuching, Sarawak",
    hours: { mon:"17:00-22:00", tue:"17:00-22:00", wed:"17:00-22:00", thu:"17:00-22:00", fri:"17:00-22:00", sat:"17:00-22:00", sun:"17:00-22:00" } 
  },
  
];

/* Fallback centroids if any entry is missing lat/lng (uses state distance) */
const MSF_STATE_CENTROIDS = {
  'Johor': {lat:1.85, lng:103.0}, 'Kedah': {lat:6.30, lng:100.40}, 'Kelantan': {lat:5.30, lng:102.20},
  'Melaka': {lat:2.20, lng:102.25}, 'Negeri Sembilan': {lat:2.70, lng:102.10}, 'Pahang': {lat:3.80, lng:102.30},
  'Penang': {lat:5.35, lng:100.29}, 'Perak': {lat:4.80, lng:101.00}, 'Perlis': {lat:6.50, lng:100.20},
  'Selangor': {lat:3.07, lng:101.50}, 'Terengganu': {lat:5.30, lng:103.10}, 'Sabah': {lat:5.50, lng:116.00},
  'Sarawak': {lat:2.50, lng:113.00}, 'Kuala Lumpur': {lat:3.139, lng:101.687}, 'Labuan': {lat:5.283, lng:115.241},
  'Putrajaya': {lat:2.926, lng:101.696}
};

/* --------------------- Helpers --------------------- */
function toRad(d){ return (d*Math.PI)/180; }
function haversine(lat1, lon1, lat2, lon2){
  const R = 6371; const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// hours: { mon:"10:00-22:00", ... } supports overnight (e.g., "18:00-02:00")
function isOpenNow(hours){
  if (!hours) return true; // if unknown, don’t filter out
  const days = ['sun','mon','tue','wed','thu','fri','sat'];
  const now = new Date();
  const d = days[now.getDay()];
  const today = hours[d];
  if (!today) return false;
  const [start, end] = today.split('-'); if (!start || !end) return false;
  const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
  const startMin = sh*60 + sm; const endMin = eh*60 + em;
  const nowMin = now.getHours()*60 + now.getMinutes();
  if (endMin >= startMin) { // same day
    return nowMin >= startMin && nowMin <= endMin;
  } else { // overnight
    return (nowMin >= startMin) || (nowMin <= endMin);
  }
}

/* --------------------- Near Me module --------------------- */
const MSF_NearMe = (() => {
  const $ = (s, el=document) => el.querySelector(s);
  let userPos = null;

  function status(msg){ const b=$("#nearStatus"); b.textContent=msg; b.classList.remove('d-none'); $("#nearError").classList.add('d-none'); }
  function error(msg){ const b=$("#nearError"); b.textContent=msg; b.classList.remove('d-none'); $("#nearStatus").classList.add('d-none'); }
  function clearAlerts(){ $("#nearError")?.classList.add('d-none'); $("#nearStatus")?.classList.add('d-none'); }

  function getLocation(){
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('Geolocation unsupported'));
      navigator.geolocation.getCurrentPosition(
        p => res({lat:p.coords.latitude, lng:p.coords.longitude}),
        e => rej(e),
        {enableHighAccuracy:true, timeout:10000, maximumAge:0}
      );
    });
  }

  function getLatLngOf(stall){
    if (typeof stall.lat === 'number' && typeof stall.lng === 'number') return {lat:stall.lat, lng:stall.lng};
    const c = MSF_STATE_CENTROIDS[stall.state]; // fallback to state center if needed
    return c ? {lat:c.lat, lng:c.lng} : null;
  }

  function render(center){
    const wrap = $("#nearResults"); wrap.innerHTML = "";
    const type = ($("#typeFilter")?.value || 'All');
    const radius = parseInt($("#radiusKm")?.value || '5', 10);
    const openNow = $("#openNow")?.checked;

    // Build & score list
    const scored = MSF_STALLS.map(s => {
      const pos = getLatLngOf(s);
      const dist = pos ? haversine(center.lat, center.lng, pos.lat, pos.lng) : Infinity;
      return {...s, distance: dist};
    });

    // Filter
    let list = scored.filter(s => Number.isFinite(s.distance));
    if (type !== 'All') list = list.filter(s => (s.type || '').toLowerCase() === type.toLowerCase());
    if (openNow)     list = list.filter(s => isOpenNow(s.hours));

    // Within radius, else show nearest 12
    const within = list.filter(s => s.distance <= radius).sort((a,b)=>a.distance-b.distance);
    const finalList = within.length ? within : list.sort((a,b)=>a.distance-b.distance).slice(0, 12);

    // nearby map link centered on user
    const mapsNearby = `https://www.google.com/maps/search/food+court+hawker+street+food/@${center.lat},${center.lng},14z`;
    const btnMaps = $("#openMapsSearch"); btnMaps.href = mapsNearby; btnMaps.classList.remove("d-none");

    if (!finalList.length){ status("No stalls found. Try a larger radius or different type."); return; }
    clearAlerts();

    const frag = document.createDocumentFragment();
    finalList.forEach(s => {
      const km = s.distance.toFixed(2);
      const pos = getLatLngOf(s);
      const dir = pos ? `https://www.google.com/maps/dir/?api=1&destination=${pos.lat},${pos.lng}` : "#";
      const badgeOpen = isOpenNow(s.hours) ? `<span class="badge bg-success ms-2">Open now</span>` : ``;
      const hoursSmall = s.hours ? `<div class="text-muted small">Hours today: ${displayTodayHours(s.hours)}</div>` : ``;

      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card shadow-soft rounded-xxl h-100">
          <div class="card-body">
            <h5 class="card-title mb-1">${s.name}${badgeOpen}</h5>
            <div class="text-muted small mb-2">${s.address || s.state || ""}</div>
            <div class="mb-2">
              <span class="badge bg-danger me-1">${s.state || '—'}</span>
              <span class="badge bg-warning text-dark">${s.type || 'Stall'}</span>
            </div>
            ${hoursSmall}
            <div class="d-flex justify-content-between align-items-center mt-2">
              <span class="fw-bold">${km} km</span>
              <a class="btn btn-sm btn-outline-primary" href="${dir}" target="_blank" rel="noopener">
                <i class="fas fa-route me-1"></i> Directions
              </a>
            </div>
          </div>
        </div>`;
      frag.appendChild(col);
    });
    wrap.appendChild(frag);
  }

  function displayTodayHours(hours){
    const days = ['sun','mon','tue','wed','thu','fri','sat'];
    const d = days[new Date().getDay()];
    return hours[d] || '—';
  }

  async function onUseLocation(){
    clearAlerts();
    status('Getting your location… (Tip: run via https or localhost)');
    try {
      const pos = await getLocation();
      status('Location found. Computing nearest stalls…');
      render(pos);
      clearAlerts();
    } catch(e){
      error('Could not get your location. Allow access and run via a local server (VS Code Live Server or python -m http.server).');
    }
  }

  function init(){
    $("#btnUseLocation")?.addEventListener('click', onUseLocation);
    $("#radiusKm")?.addEventListener('change', () => { if (userPos) render(userPos); });
    $("#typeFilter")?.addEventListener('change', () => { if (userPos) render(userPos); });
    $("#openNow")?.addEventListener('change', () => { if (userPos) render(userPos); });
  }

  return { init };
})();

// Function to handle the search
function searchFood() {
  const query = document.getElementById("foodSearch").value.trim().toLowerCase();
  
  // Check if the search query is empty
  if (!query) {
    alert("Please enter a food name, state, or race.");
    return;
  }

  // Map of search results to redirect
  const searchResults = {
  // Malay Food
  "nasi lemak": "malay.html",
  "satay": "malay.html",
  "roti canai": "malay.html",
  "nasi kerabu": "malay.html",
  "nasi tumpang": "terengganu.html",
  "mee goreng": "malay.html",
  "laksam": "kelantan.html",
  "kuih lapis": "sarawak.html",
  "mee rebus": "johor.html",
  "roti john": "kuala lumpur.html",

  // Chinese Food
  "char kway teow": "chinese.html",
  "hokkien mee": "penang.html",
  "chee cheong fun": "penang.html",
  "dim sum": "perak.html",
  "lok lok": "penang.html",
  "lor mee": "penang.html",
  "wantan mee": "kuala lumpur.html",
  "popiah": "penang.html",
  "chicken rice": "perak.html",
  "asam laksa": "penang.html",

  // Indian Food
  "vada": "indian.html",
  "murtabak": "johor.html",
  "teh tarik": "penang.html",
  "banana leaf rice": "selangor.html",
  "pani puri": "kuala lumpur.html",
  "chapati": "kuala lumpur.html",
  "samosa": "penang.html",
  "idli": "kuala lumpur.html",
  "kothu roti": "kuala lumpur.html",
  "dosa": "kuala lumpur.html",

  // Other Food
  "tuhau": "sabah.html",
  "ambuyat": "sabah.html",
  "hinava": "sabah.html",
  "kacang pool": "johor.html",
  "cincaluk": "melaka.html",
  "pinasakan": "sabah.html",
  "tinumis": "sabah.html",
  "nasi kuning": "sabah.html",
  "tapioca cake": "northern states.html",
  "sago gula melaka": "melaka.html",

  // States
  "penang": "penang.html",
  "perak": "perak.html",
  "melaka": "malacca.html",
  "selangor": "selangor.html",
  "kelantan": "kelantan.html",
  "sarawak": "sarawak.html",
  "sabah": "sabah.html",
  "negeri sembilan": "negerisembilan.html",

  // Races
  "malay": "malay.html",
  "chinese": "chinese.html",
  "indian": "indian.html",
  "other": "other.html"
};

  // Redirect to the page based on search query
  if (searchResults[query]) {
    window.location.href = searchResults[query];
  } else {
    alert("No results found for your search.");
  }
}

// Check login state when page loads
document.addEventListener('DOMContentLoaded', function () {
  const navUser = document.getElementById('navUser');
  const usernameDisplay = document.getElementById('usernameDisplay');
  const btnLogin = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const btnLogout = document.getElementById('btnLogout');

  // Check if the user is logged in (localStorage)
  const username = localStorage.getItem('username');

  if (username) {
    // If logged in, show the user's name and logout button
    navUser.classList.remove('d-none');
    usernameDisplay.innerText = `Hello, ${username}`; // Display the username
    btnLogin.classList.add('d-none');  // Hide the Login button
    btnSignup.classList.add('d-none');  // Hide the Sign Up button
    btnLogout.classList.remove('d-none');  // Show the Logout button
  } else {
    // If not logged in, show Login and Sign Up buttons, hide the Logout button
    navUser.classList.add('d-none');
    btnLogin.classList.remove('d-none');
    btnSignup.classList.remove('d-none');
    btnLogout.classList.add('d-none');
  }

  // Handle Logout
  btnLogout.addEventListener('click', function () {
    // Remove the username from localStorage
    localStorage.removeItem('username');
    // Reset the navbar to the initial state
    navUser.classList.add('d-none');
    btnLogin.classList.remove('d-none');
    btnSignup.classList.remove('d-none');
    btnLogout.classList.add('d-none');
  });

  // Login form submission (inside the modal)
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Here, you should add your real authentication logic
    if (username && password) {
      localStorage.setItem('username', username); // Store username in localStorage
      navUser.classList.remove('d-none');
      usernameDisplay.innerText = username;
      btnLogin.classList.add('d-none');
      btnSignup.classList.add('d-none');
      btnLogout.classList.remove('d-none');

      // Close the modal after successful login
      loginModal.hide();
    } else {
      alert('Please enter both username and password');
    }
  });

  // Function for handling the search bar functionality
  window.searchFood = function() {
    const searchQuery = foodSearchInput.value.trim().toLowerCase();

    // Redirect based on the search input
    if (searchQuery) {
      // Search for states
      const states = [
        'johor', 'kedah', 'kelantan', 'malacca', 'negerisembilan', 'pahang', 'penang', 'perak', 'perlis', 'sabah', 'sarawak', 'selangor', 'terengganu'
      ];
      const stateFound = states.find(state => state.toLowerCase() === searchQuery);
      if (stateFound) {
        window.location.href = `${stateFound}.html`;
        return;
      }

      // Search for races
      const races = ['chinese', 'indian', 'malay', 'other'];
      const raceFound = races.find(race => race.toLowerCase() === searchQuery);
      if (raceFound) {
        window.location.href = `${raceFound}.html`;
        return;
      }

      // Search for food types
      const foodItems = [
        'cendol', 'nasi lemak', 'laksa', 'char kway teow', 'roti canai', 'satay'
      ];
      const foodFound = foodItems.find(food => food.toLowerCase() === searchQuery);
      if (foodFound) {
        // Redirect to a generic food page or specific one if needed
        window.location.href = `malay.html`; // Can be refined based on the exact food item
        return;
      }

      // If nothing matches, show an alert or message to the user
      alert("No results found. Please try again.");
    }
  }
});

// JavaScript to make the scroll-to-top button functional
document.addEventListener('DOMContentLoaded', function () {
  const scrollTopBtn = document.querySelector('.floating-action');

  // Show the button when the user scrolls down 200px from the top
  window.addEventListener('scroll', function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      scrollTopBtn.style.display = 'block';
    } else {
      scrollTopBtn.style.display = 'none';
    }
  });

  // Scroll to the top of the page when the button is clicked
  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const navbar = document.querySelector('.app-navbar');
  let lastScrollTop = 0; // Initialize last scroll position

  // Add event listener to track scroll direction
  window.addEventListener('scroll', function () {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // If the user scrolls down, hide the navbar
    if (currentScroll > lastScrollTop) {
      navbar.style.top = "-80px"; // Hide navbar by moving it out of view (adjust based on navbar height)
    } else {
      // If the user scrolls up, show the navbar again
      navbar.style.top = "0"; // Reset navbar position
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Prevent negative scroll values
  });
});

