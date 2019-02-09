import $ from 'jquery';
import 'what-input';

// Foundation JS relies on a global varaible. In ES6, all imports are hoisted
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

const firebase = require("firebase");
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
    });
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