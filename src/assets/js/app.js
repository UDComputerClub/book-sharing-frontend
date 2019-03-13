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

let userInfo;
let db = firebase.firestore();
const storageService = firebase.storage();
const storageRef = storageService.ref();

function addListingCard(listOfListings, currentIndex, jQuerySelector) {
    if(currentIndex >= listOfListings.length) {
        return
    }
    const aListing = listOfListings[currentIndex];
    console.log(aListing);
    currentIndex++;
    const name = aListing.name === undefined ? "" : aListing.name;
    const sellingPrice = aListing.sellingPrice === undefined ? "" : "$" + aListing.sellingPrice;
    const rentalPrice = aListing.rentalPrice === undefined ? "" : "$" + aListing.rentalPrice;
    const theClassName = aListing.theClassName === undefined ? "" : aListing.theClassName;
    const professor = aListing.professor === undefined ? "" : aListing.professor;
    const contactInfo = aListing.contactInfo === undefined ? "" : aListing.contactInfo;
    function cardHTML(imageUrl) {
        let theHTML = `<div class="card">
            <div class="card-divider">
                <h4>${name}</h4>
            </div>
            <div class="card-section">`;
        if (imageUrl !== null) {
            theHTML += `<img class="book-image" src="${imageUrl}">`;
        }
        theHTML += `<table class="unstriped show-for-medium">
                    <thead>
                    <tr>
                        <th>Buy</th>
                        <th>Rent</th>
                        <th>Class</th>
                        <th>Professor</th>
                        <th>Contact</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>${sellingPrice}</td>
                        <td>${rentalPrice}</td>
                        <td>${theClassName}</td>
                        <td>${professor}</td>
                        <td>${contactInfo}</td>
                    </tr>
                    </tbody>
                </table>
                <table class="unstriped show-for-small-only">
                    <thead>
                    <tr>
                        <th>Buy</th>
                        <th>Rent</th>
                        <th>Contact</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>${sellingPrice}</td>
                        <td>${rentalPrice}</td>
                        <td>${contactInfo}</td>
                    </tr>
                    </tbody>
                </table>`;
        if (theClassName !== "" || professor !== "") {
            theHTML += `<table class="unstriped show-for-small-only">
                    <thead>
                    <tr>
                        <th>Class</th>
                        <th>Professor</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>${theClassName}</td>
                        <td>${professor}</td>
                    </tr>
                    </tbody>
                </table>`;
        }
        theHTML += `</div></div>`;
        //
        //         `<table class="unstriped show-for-medium show-for-small">
        //             <thead>
        //             <tr>
        //                 <th>Buy</th>
        //                 <th>Rent</th>
        //                 <th>Contact</th>
        //             </tr>
        //             </thead>
        //             <tbody>
        //             <tr>
        //                 <td>${sellingPrice}</td>
        //                 <td>${rentalPrice}</td>
        //                 <td>${contactInfo}</td>
        //             </tr>
        //             </tbody>
        //         </table>`;
        //         `<img class="book-image" src="${imageUrl}">
        //         <p></p>
        //         <table class="unstriped show-for-large-only">
        //             <thead>
        //             <tr>
        //                 <th>Buy</th>
        //                 <th>Rent</th>
        //                 <th>Class</th>
        //                 <th>Professor</th>
        //                 <th>Contact</th>
        //             </tr>
        //             </thead>
        //             <tbody>
        //             <tr>
        //                 <td>${sellingPrice}</td>
        //                 <td>${rentalPrice}</td>
        //                 <td>${theClassName}</td>
        //                 <td>${professor}</td>
        //                 <td>${contactInfo}</td>
        //             </tr>
        //             </tbody>
        //         </table>
        //         <table class="unstriped show-for-medium show-for-small">
        //             <thead>
        //             <tr>
        //                 <th>Buy</th>
        //                 <th>Rent</th>
        //                 <th>Contact</th>
        //             </tr>
        //             </thead>
        //             <tbody>
        //             <tr>
        //                 <td>${sellingPrice}</td>
        //                 <td>${rentalPrice}</td>
        //                 <td>${contactInfo}</td>
        //             </tr>
        //             </tbody>
        //         </table>
        //         <table class="unstriped show-for-medium show-for-small">
        //             <thead>
        //             <tr>
        //                 <th>Class</th>
        //                 <th>Professor</th>
        //             </tr>
        //             </thead>
        //             <tbody>
        //             <tr>
        //                 <td>${theClassName}</td>
        //                 <td>${professor}</td>
        //             </tr>
        //             </tbody>
        //         </table>
        //     </div>
        // </div>`;
        return theHTML;
    }
    if (aListing.image !== undefined) {
        // Create a reference to the file we want to download
        const imageRef = storageRef.child(aListing.image);
        // Get the download URL
        imageRef.getDownloadURL().then(function(url) {
            // Insert url into an <img> tag to "download"
            jQuerySelector.append(cardHTML(url));
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
        jQuerySelector.append(cardHTML(null));
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

function postListing() {
    const createListingButton = $("#create-listing-button");
    createListingButton.attr("disabled", "disabled");
    const bookName = $.trim($("#book-name").val());
    const contactInfo = $.trim($("#contact-info").val());
    let validInput = true;
    if (bookName === "") {
        validInput = false;
        addAlert("book-name");
    }
    if (contactInfo === "") {
        validInput = false;
        addAlert("contact-info");
    }
    if (!validInput) {
        $("#invalid-form-warning").html("Please enter all required info");
        createListingButton.removeAttr("disabled");
        return;
    }
    let theListing = {
        uid: userInfo.uid,
        timestamp: Date.now(),
        name: bookName,
        contactInfo: contactInfo,
    };
    const professor = $.trim($("#professor").val());
    if (professor !== "") {
        theListing.professor = professor;
    }
    const theClassName = $.trim($("#class-name").val());
    if (theClassName !== "") {
        theListing.theClassName = theClassName;
    }
    const sellRadio = $("#sell");
    const rentRadio = $("#rent");
    const rentOrSellRadio = $("#rent-or-sell");
    let sellingPrice = $("#selling-price").val();
    let rentalPrice = $("#rental-price").val();
    if (sellingPrice === "") {
        sellingPrice = 0;
    }
    if (rentalPrice === "") {
        rentalPrice = 0;
    }
    if (rentOrSellRadio.is(":checked")) {
        theListing.sellingPrice = sellingPrice;
        theListing.rentalPrice = rentalPrice;
    }else if (sellRadio.is(":checked")) {
        theListing.sellingPrice = sellingPrice;
    }else if (rentRadio.is(":checked")) {
        theListing.rentalPrice = rentalPrice;
    }else{
        console.log("could not find checked radio");
    }

    function postListingSuccess() {
        createListingButton.removeAttr("disabled");
        $("#listing-post-result").html("Successfully Created Listing!");
        document.getElementById("listing-post-result").style.color = "#228440";
        $("#book-name").val("");
    }

    function postListingError() {
        createListingButton.removeAttr("disabled");
        $("#listing-post-result").html("Could not create listing");
        document.getElementById("listing-post-result").style.color = "#ff3d43";
    }

    function addListing(pathToImage) {
        if (pathToImage !== null) {
            theListing.image = pathToImage;
        }
        // Add a new document with a generated id.
        db.collection("/listings").add(theListing)
            .then(function () {
                postListingSuccess();
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                postListingError();
                console.error("Error writing document: ", error);
            });
    }
    // for some reason, jquery can't be used for this
    const imageToUpload = document.getElementById("image-upload").files[0];
    if (imageToUpload !== undefined) {
        //const imageToUpload = imageFiles[0];
        const imagePath = `images/${imageToUpload.name}`;
        const uploadTask = storageRef.child(imagePath).put(imageToUpload);
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
        }, (error) => {
            // Handle unsuccessful uploads
            postListingError();
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

function initLoginPage() {
    // FirebaseUI config.
    const uiConfig = {
        signInSuccessUrl: '/login.html',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
    };
    firebase.auth().onAuthStateChanged(function (user) {
        if (user && user.email.endsWith("@udallas.edu")) {
            // User is signed in. Redirect to main page.
            window.location.assign('/');
        }
    }, function (error) {
        console.log(error);
    });
    // Initialize the FirebaseUI Widget using Firebase.
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
}

let inputBackgroundColor;
const alertBackgroundColor = "#fff2f9";

function addAlert(elementId) {
    const element = document.getElementById(elementId);
    element.style.backgroundColor = alertBackgroundColor;
}

function removeAlert(elementId) {
    const element = document.getElementById(elementId);
    element.style.backgroundColor = inputBackgroundColor;
}

function initApp() {
    $("#create-listing-button").click(postListing);
    $("#listing-search-button").click(searchListings);
    $("#new-listings-refresh-button").click(getRecentListings);
    $("#sign-out-button").click(signOut);
    $("#sell").click(function() {
        $("#selling-price").removeAttr("disabled");
        $("#rental-price").attr("disabled", "disabled");
    });
    $("#rent").click(function() {
        $("#rental-price").removeAttr("disabled");
        $("#selling-price").attr("disabled", "disabled");
    });
    $("#rent-or-sell").click(function() {
        $("#rental-price").removeAttr("disabled");
        $("#selling-price").removeAttr("disabled");
    });
    const sampleInput = document.getElementById("book-name");
    inputBackgroundColor = sampleInput.style.backgroundColor;
    $("#book-name").change(function(){
        $("#invalid-form-warning").html("");
        $("#listing-post-result").html("");
        removeAlert("book-name");
    });
    $("#contact-info").change(function(){
        removeAlert("contact-info");
    });
    $(document).ready(getRecentListings);

    firebase.auth().onAuthStateChanged(function (user) {
        if (user && user.email.endsWith("@udallas.edu")) {
            // User is signed in.
            userInfo = user;
            $("#user-name").html(user.displayName);
            $("#user-email").html(user.email);
            // TODO should also show the user's given contact info and give option to change it

            // jquery doesn't work changing style i guess
            const photoElement = document.getElementById("user-photo");
            if (user.photoURL) {
                let photoURL = user.photoURL;
                // Append size to the photo URL for Google hosted images to avoid requesting
                // the image with its original resolution (using more bandwidth than needed)
                // when it is going to be presented in smaller size.
                if ((photoURL.indexOf("googleusercontent.com") !== -1) ||
                    (photoURL.indexOf("ggpht.com") !== -1)) {
                    photoURL = photoURL + '?sz=' + photoElement.clientHeight;
                }
                photoElement.src = photoURL;
                photoElement.style.display = 'block';
            } else {
                photoElement.style.display = 'none';
            }
        } else {
            // User is signed out. Redirect to login page.
            window.location.assign('/login.html');
        }
    }, function (error) {
        console.log(error);
    });
}

window.addEventListener('load', function () {
    const path = window.location.pathname;
    if (path === '/login.html') {
        initLoginPage();
    }else if (path === '/') {
        initApp();
    }else{
        console.log('unknown path');
    }
});

// TODO add the ability to delete account?
function deleteAccount() {
    firebase.auth().currentUser.delete().catch(function(error) {
        if (error.code === 'auth/requires-recent-login') {
            // The user's credential is too old. She needs to sign in again.
            firebase.auth().signOut().then(function() {
                // The timeout allows the message to be displayed after the UI has
                // changed to the signed out state.
                setTimeout(function() {
                    alert('Please sign in again to delete your account.');
                }, 1);
            });
        }
    });
}

function signOut() {
    // we don't need to redirect to login page since
    // the listener made in initApp() will do that
    firebase.auth().signOut().then(function() {});
}

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
