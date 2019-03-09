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
db.collection("books").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        let json = doc.data();
        let name = '';
        if(json['name'] !== undefined){
            name = json['name'];
        }
        let professor = '';
        if(json['professor'] !== undefined){
            professor = json['professor'];
        }
        let card = `<div class="card">
            <div class="card-divider">
                ${name}
            </div>
            <img width="220" src="https://images-na.ssl-images-amazon.com/images/I/51UiI6CdvmL._SX340_BO1,204,203,200_.jpg">
            <div class="card-section">
                <p>Price: $42.00</p>
                <p>Professor: ${professor}</p>
            </div>
        </div>`;
        $('.new-postings').append(card);
    });
});
let userInfo;
function postListing() {
    // Add a new document with a generated id.
    db.collection("books").add({
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
    privacyPolicyUrl: function() {
        window.location.assign('<your-privacy-policy-url>');
    }
};

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);


function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userInfo = user;
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            user.getIdToken().then(function(accessToken) {
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
    }, function(error) {
        console.log(error);
    });
}

window.addEventListener('load', function() {
    initApp()
});







function getBookList(){
    let request = $.ajax({
        url: "https://booksharing-40ba7.firebaseio.com",
        method: "GET",
        dataType: "json"
    });

    request.done(function( data ) {
        $( ".data" ).html( data );
    });

    request.fail(function( jqXHR, textStatus ) {
        $( ".error" ).html( textStatus );
    });
}

//$(document).ready(getBookList);