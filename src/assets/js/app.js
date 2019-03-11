import $ from 'jquery';
import 'what-input';

// Foundation JS relies on a global variable. In ES6, all imports are hoisted
// to the top of the file so if we used`import` to import Foundation,
// it would execute earlier than we have assigned the global variable.
// This is why we have to use CommonJS require() here since it doesn't
// have the hoisting behavior.
window.jQuery = $;
require('foundation-sites');

// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';


$(document).foundation();

const firebase = require('firebase/app');
const firebaseui = require('firebaseui');
// Required for side-effects
require("firebase/firestore");

// Initialize Firebase
let config = {
    apiKey: "AIzaSyCJNFt6hY3AuZoTKPTE-oEhLYbRlu6CHO4",
    authDomain: "booksharing-40ba7.firebaseapp.com",
    databaseURL: "https://booksharing-40ba7.firebaseio.com",
    projectId: "booksharing-40ba7",
    storageBucket: "booksharing-40ba7.appspot.com",
    messagingSenderId: "606585176318"
};
firebase.initializeApp(config);
let db = firebase.firestore();
db.collection("listings").get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        let json = doc.data();
        let name = '';
        if (json['name'] !== undefined) {
            name = json['name'];
        }
        let professor = '';
        if (json['professor'] !== undefined) {
            professor = json['professor'];
        }
        let price = '';
        if (json['price'] !== undefined) {
            price = json['price'];
        }
        let card = `<div class="card">
            <div class="card-divider">
                ${name}
            </div>
            <img width="220" src="https://images-na.ssl-images-amazon.com/images/I/51UiI6CdvmL._SX340_BO1,204,203,200_.jpg">
            <div class="card-section">
                <p>Price: \$${price}</p>
                <p>Professor: ${professor}</p>
            </div>
        </div>`;
        $('.new-postings').append(card);
    });
});

let userInfo;

function postListing() {
    // Add a new document with a generated id.
    db.collection("/listings").add({
        uid: userInfo.uid,
        name: $("#book-name").val(),
        professor: $("#professor").val(),
        price: $("#price").val()
    })
        .then(function () {
            console.log("Document successfully written!");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}

$("#create-listing-button").click(postListing);
$("#listing-search-button").click(searchListings);

// FirebaseUI config.
const uiConfig = {
    signInSuccessUrl: '',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    tosUrl: '<your-tos-url>',
    // Privacy policy url/callback.
    privacyPolicyUrl: function () {
        window.location.assign('<your-privacy-policy-url>');
    }
};

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);


function initApp() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userInfo = user;
            // User is signed in.
            const displayName = user.displayName;
            const email = user.email;
            const emailVerified = user.emailVerified;
            const photoURL = user.photoURL;
            const uid = user.uid;
            const phoneNumber = user.phoneNumber;
            const providerData = user.providerData;
            user.getIdToken().then(function (accessToken) {
                $("#sign-in-status").html('Signed in');
                $("#sign-in").html('Sign out');
                $("#account-details").html(
                    JSON.stringify({
                        displayName: displayName,
                        email: email,
                        emailVerified: emailVerified,
                        phoneNumber: phoneNumber,
                        photoURL: photoURL,
                        uid: uid,
                        accessToken: accessToken,
                        providerData: providerData
                    }, null, '  ')
                );
            });
        } else {
            // User is signed out.
            $("#sign-in-status").html('Signed out');
            $("#sign-in").html('Sign in');
            $("#account-details").html('null');
        }
    }, function (error) {
        console.log(error);
    });
}

window.addEventListener('load', function () {
    initApp()
});

//$(document).ready(getBookList);
const gapScore = 3;
const swapScore = 2;
const matchScore = 0;
const memos = new Map();
function optimal(bitshift, string1, string2, i, j) {
    const bitmask = (i << bitshift) | j;
    if (memos.has(bitmask)) {
        return memos.get(bitmask);
    }
    if (i === 0) {
        return j * gapScore;
    }
    if (j === 0) {
        return i * gapScore;
    }
    let aScore = optimal(bitshift, string1, string2, i - 1, j) + gapScore;
    aScore = Math.min(aScore, optimal(bitshift, string1, string2, i, j - 1) + gapScore);
    let scoreChange = 0;
    if (string1.charAt(i - 1) === string2.charAt(j - 1)) {
        scoreChange = matchScore;
    } else {
        scoreChange = swapScore;
    }
    aScore = Math.min(aScore, optimal(bitshift, string1, string2, i - 1, j - 1) + scoreChange);
    memos.set(bitmask, aScore);
    return aScore;
}

function alignmentScore(string1, string2) {
    // console.log("doing a score!");
    // console.log(string1);
    // console.log(string2);
    // console.log(string1.length);
    // console.log(string2.length);
    memos.clear();
    if (string1.length < string2.length) {
        const bitshiftAmount = Math.ceil(Math.log2(string1.length));
        return optimal(bitshiftAmount, string2, string1, string2.length, string1.length);
    }
    const bitshiftAmount = Math.ceil(Math.log2(string2.length));
    return optimal(bitshiftAmount, string1, string2, string1.length, string2.length);
}

function displaySearchResults(listings) {
    const searchResults = $("#search-results");
    searchResults.html("");
    let newHTML = "";
    for(const aListing of listings) {
        let card = `<div class="card">
            <div class="card-divider">
                ${aListing.name}
            </div>
            <img width="220" src="https://images-na.ssl-images-amazon.com/images/I/51UiI6CdvmL._SX340_BO1,204,203,200_.jpg">
            <div class="card-section">
                <p>Price: \$${aListing.price}</p>
                <p>Professor: ${aListing.professor}</p>
            </div>
        </div>`;
        newHTML += card;
    }
    searchResults.html(newHTML);
}

function getSearchScores(listings, searchString) {
    const threshold = 20;
    let searchResults = [];
    // console.log("listings:");
    // console.log(listings);
    for(const aListing of listings) {
        const score = alignmentScore(aListing["name"], searchString);
        console.log("score:");
        console.log(score);
        console.log("for " + aListing["name"] + ", " + searchString);
        if(score < threshold) {
            searchResults.push([score, aListing]);
        }
    }
    searchResults.sort(function(a, b){return b[0] - a[0]});
    // console.log("searchResults:");
    // console.log(searchResults);
    let matchingListings = [];
    for(const aResult of searchResults) {
        matchingListings.push(aResult[1]);
    }
    displaySearchResults(matchingListings);
}

function searchListings() {
    const searchString = $("#book-name-search-box").val();
    db.collection("listings").get().then(function (querySnapshot) {
        let listings = [];
        querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            let json = doc.data();
            if (json['name'] !== undefined) {
                listings.push(json);
            }
        });
        getSearchScores(listings, searchString);
    });
}