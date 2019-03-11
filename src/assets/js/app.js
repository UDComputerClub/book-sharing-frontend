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
require("firebase/storage");

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
const storageService = firebase.storage();
const storageRef = storageService.ref();

$("#create-listing-button").click(postListing);
$("#listing-search-button").click(searchListings);
$("#new-listings-refresh-button").click(getRecentListings);
$(document).ready(getRecentListings);

function addListingCard(listOfListings, currentIndex, jQuerySelector) {
    if(currentIndex >= listOfListings.length) {
        return
    }
    const aListing = listOfListings[currentIndex];
    currentIndex++;
    const name = aListing.name;
    const professor = aListing.professor;
    const price = aListing.price;
    function cardWithImageHTML(imageUrl) {
        return `<div class="card">
            <div class="card-divider">
                ${name}
            </div>
            <div class="card-section">
                <img class="book-image" src="${imageUrl}">
                <p>Price: \$${price}</p>
                <p>Professor: ${professor}</p>
            </div>
        </div>`;
    }
    function cardWithoutImageHTML() {
        return `<div class="card">
            <div class="card-divider">
                ${name}
            </div>
            <div class="card-section">
                <p>Price: \$${price}</p>
                <p>Professor: ${professor}</p>
            </div>
        </div>`;
    }
    if (aListing.image !== undefined) {
        // Create a reference to the file we want to download
        const imageRef = storageRef.child(aListing.image);
        // Get the download URL
        imageRef.getDownloadURL().then(function(url) {
            // Insert url into an <img> tag to "download"
            jQuerySelector.append(cardWithImageHTML(url));
            addListingCard(listOfListings, currentIndex, jQuerySelector);
        }).catch(function(error) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/object-not-found':
                    // File doesn't exist
                    break;
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':
                    // User canceled the upload
                    break;
                case 'storage/unknown':
                    // Unknown error occurred, inspect the server response
                    break;
            }
        });
    }else{
        jQuerySelector.append(cardWithoutImageHTML());
        addListingCard(listOfListings, currentIndex, jQuerySelector);
    }
}

function getRecentListings() {
    const maxToGet = 10;
    db.collection("listings").orderBy("timestamp", "desc").limit(maxToGet).get()
        .then(function (querySnapshot) {
            const newListings = $("#new-listings");
            newListings.html("");
            let listOfListings = [];
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
                let aListing = doc.data();
                listOfListings.push(aListing);
            });
            addListingCard(listOfListings, 0, newListings);
        });
}

let userInfo;

function postListing() {
    let theListing = {
        uid: userInfo.uid,
        timestamp: Date.now(),
        name: $("#book-name").val(),
        professor: $("#professor").val(),
        price: $("#price").val(),
    };
    function addListing(pathToImage) {
        if (pathToImage !== null) {
            theListing.image = pathToImage;
        }
        // Add a new document with a generated id.
        db.collection("/listings").add(theListing)
            .then(function () {
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    }
    // for some reason, jquery can't be used for this
    const imageFiles = document.getElementById("image-upload").files;
    if (imageFiles !== undefined) {
        const imageToUpload = imageFiles[0];
        const imagePath = `images/${imageToUpload.name}`;
        const uploadTask = storageRef.child(imagePath).put(imageToUpload);
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
        }, (error) => {
            // Handle unsuccessful uploads
            console.log(error);
        }, () => {
            // Do something once upload is complete
            console.log('success');
            addListing(imagePath);
        });
    }else{
        addListing(null);
    }
}
console.log(window.location.search);
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has("you")) {
    console.log(searchParams.get("you"));
}else{
    console.log("no u");
}

// FirebaseUI config.
const uiConfig = {
    signInSuccessUrl: '/',//http://localhost:63342/book-sharing-frontend/dist/index.html',
    // signInFlow: 'popup',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        // firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    // tosUrl: '<your-tos-url>',
    // // Privacy policy url/callback.
    // privacyPolicyUrl: function () {
    //     window.location.assign('<your-privacy-policy-url>');
    // }
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
                // $("#sign-in-status").html('Signed in');
                // $("#sign-in").html('Sign out');
                // $("#account-details").html(
                //     JSON.stringify({
                //         displayName: displayName,
                //         email: email,
                //         emailVerified: emailVerified,
                //         phoneNumber: phoneNumber,
                //         photoURL: photoURL,
                //         uid: uid,
                //         accessToken: accessToken,
                //         providerData: providerData
                //     }, null, '  ')
                // );
            });
        } else {
            // User is signed out.
            // $("#sign-in-status").html('Signed out');
            // $("#sign-in").html('Sign in');
            // $("#account-details").html('null');
        }
    }, function (error) {
        console.log(error);
    });
}

window.addEventListener('load', function () {
    initApp()
});

function alignmentScore(string1, string2) {
    const gapScore = 3;
    const swapScore = 2;
    const matchScore = 0;
    const memos = new Map();
    let bitshiftAmount;
    const s1 = string1.toLowerCase();
    const s2 = string2.toLowerCase();
    if (string1.length < string2.length) {
        bitshiftAmount = Math.ceil(Math.log2(string1.length));
        return optimal(string2.length, string1.length);
    }else{
        bitshiftAmount = Math.ceil(Math.log2(string2.length));
    }
    return optimal(string1.length, string2.length);

    function optimal(i, j) {
        const bitmask = (i << bitshiftAmount) | j;
        if (memos.has(bitmask)) {
            return memos.get(bitmask);
        }
        if (i === 0) {
            return j * gapScore;
        }
        if (j === 0) {
            return i * gapScore;
        }
        let aScore = optimal(i - 1, j) + gapScore;
        aScore = Math.min(aScore, optimal(i, j - 1) + gapScore);
        let scoreChange = 0;
        if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
            scoreChange = matchScore;
        } else {
            scoreChange = swapScore;
        }
        aScore = Math.min(aScore, optimal(i - 1, j - 1) + scoreChange);
        memos.set(bitmask, aScore);
        return aScore;
    }
}

function displaySearchResults(listings) {
    const maxToDisplay = 10;
    const searchResults = $("#search-results");
    searchResults.html("");
    addListingCard(listings.slice(0, maxToDisplay), 0, searchResults);
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
    searchResults.sort(function(a, b){return a[0] - b[0]});
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
// let selectedFile;
// function handleFileUploadChange(e) {
//     selectedFile = e.target.files[0];
// }
// function handleFileUploadSubmit(e) {
//     const uploadTask = storageRef.child(`images/${selectedFile.name}`).put(selectedFile); //create a child directory called images, and place the file inside this directory
//     uploadTask.on('state_changed', (snapshot) => {
//         // Observe state change events such as progress, pause, and resume
//     }, (error) => {
//         // Handle unsuccessful uploads
//         console.log(error);
//     }, () => {
//         // Do something once upload is complete
//         console.log('success');
//     });
// }
// document.querySelector('#image-upload').addEventListener('change', handleFileUploadChange);
// document.querySelector('.file-submit').addEventListener('click', handleFileUploadSubmit);