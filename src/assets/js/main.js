require('jquery');
require('jquery-modal/jquery.modal.min.js');
require('jquery-modal/jquery.modal.min.css');
require('odometer');
var WOW = require('wow.js');
require('animate.css');
require('slick-carousel');
require('slick-carousel/slick/slick.css');

new WOW().init();

var firebase = require("firebase");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCgz2Qh-rGtNhJMae9edXr5JF7-y5V0Zgw",
  authDomain: "harashbi-86a7f.firebaseapp.com",
  databaseURL: "https://harashbi-86a7f.firebaseio.com",
  projectId: "harashbi-86a7f",
  storageBucket: "harashbi-86a7f.appspot.com",
  messagingSenderId: "412663073382"
};
firebase.initializeApp(config);

var database = firebase.database();

function postTransactions(e, form) {
  var form = $(form);
  var formData = form.serializeObject();
  var obj = {}
  obj.name = formData.UMname ? formData.UMname : '',
  obj.email = formData.email ? formData.email : '',
  obj.phone = formData.phone ? formData.phone : '',
  obj.country = formData.country ? formData.country : '',
  obj.street = formData.UMstreet ? formData.UMstreet : '',
  obj.state = formData.state ? formData.state : '',
  obj.city = formData.city ? formData.city : '',
  obj.zipCode = formData.UMzip ? formData.UMzip : '',
  obj.kvitel = formData.kvitel ? formData.kvitel : '',
  obj.amount = formData.UMamount ? formData.UMamount : '',
  obj.date = firebase.database.ServerValue.TIMESTAMP;
  firebase.database().ref('donations')
  .push(obj)
  .then(function(snap){
    const key = snap.key;
    sessionStorage.setItem('transactionKey', JSON.stringify({key:key}));
  });
  return true;
};

var card = require('card');

$(document).ready(function() {
  if ($(window).width() < 800) {
    var hamburger = $(".hamburger");
    var mobileNav = $(".mobile-nav");
    var ex = $(".mobile-nav_header .closer");
    var body = $("body");
    hamburger.click(function() {
      mobileNav.addClass("open");
      body.addClass("cover");
    });

    ex.click(function() {
      mobileNav.removeClass("open");
      body.removeClass("cover");
    });
  };

  var audio = new Audio('assets/audio/music.mp3');
  var play = $('.play');
  var pause = $('.pause');
  pause.hide();
  audio.volume = 0.1;
  audio.pause();
  play.on('click', function(e){
    play.hide();
    pause.show();
    audio.play();
    
  })
  pause.on('click', function(e){
    pause.hide();
    play.show();
    audio.pause();
    
  })

  var odometer = $('.odometer');
  var years = $('.odometer.years').text('25')
  var milk = $('.odometer.milk').text('60,000')
  var drinks = $('.odometer.drinks').text('2,000,000')

  $('.submit-section_button').on('click', function(e){
    if(totalAmount.attr('amount') == 0 || totalAmount.attr('amount') == undefined) {
      totalAmountSection.after('<div class="error">Please select a donation amount</div>');
      e.preventDefault();
      return;
    }

    var form = $('form.donation-form').serializeObject();
    console.log(form);
    
    if (form['g-recaptcha-response']) {
      $.post("recaptcha", {secret: "6LdR-cAUAAAAAGKRn5Nf2Tnk-8c9a88RCdnj3gJV", response: form['g-recaptcha-response']}, function( data ) {
        if (data.success) {
          submitApplication();
        } else {
          e.preventDefault();
          return;
        }
      });
    }
    else
    {
    //The recaptcha is not cheched
    //You can display an error message here
    alert('Oops, you have to check the recaptcha !');
    }

    e.preventDefault();
    return;
  });

  $('form.donation-form').on('submit', function (e) {
    postTransactions(e, e.target);
    saveFormData(e);
   })

  var submitApplication = function (e) {
    console.log("submitting");
    $('.submit-button').click();
  }
  
  var card = new Card({
    form: '.donate-form',
    container: '.card-container',
    formSelectors: {
      numberInput: 'input#cc-number', // optional — default input[name="number"]
      expiryInput: 'input#expiry', // optional — default input[name="expiry"]
      cvcInput: 'input#cvc', // optional — default input[name="cvc"]
      nameInput: 'input#cc-name' // optional - defaults input[name="name"]
    }
  });

  var amountInput = $('[name=UMamount]');
  var totalAmount = $('.submit-section_total-amount');
  var totalAmountSection = $('.submit-section_total');
  var costomAmount = $('.costom-amount');
  var privateKvital = $('#private-kvital');
  var publicKvital = $('.field_input.kvitel');
  $('.donate-card').each(function(i, el){
    $(el).on('click', function(e){
      costomAmount.val('')
      amountInput.val($(this).attr('amount'));
      $('.donate-card').each(function(i, el){
        $(el).removeClass('donate-card--active');
      })
      $(this).addClass('donate-card--active');
      updateTotalValue(amountInput.val());
    })
  });

  costomAmount.on('keyup', function(e){
    $('.donate-card').each(function(i, el){
      $(el).removeClass('donate-card--active');
    });
    amountInput.val($(e.target).val());
    updateTotalValue(amountInput.val());
  })

  privateKvital.on('keyup', function(e){
    publicKvital.val(e.target.value)
  })

  function updateTotalValue(value) {
    var total = (+value).formatMoney(2, '.', ',');
    totalAmount.text('$'+total);
    totalAmount.attr('amount', (+value).formatMoney(0));
    console.log(totalAmount.attr('amount'))
  }

  var search = location.search.substring(1);
  if(search) {
    var result = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    var success = $('#success-message').hide();
    var error = $('#error-message').hide();
    if(result.UMstatus == 'Approved'){
      success.show();
      deleteFormData();
    } else if (result.UMstatus == "Declined" || result.UMstatus == 'Error') {
      error.show();
      fillInFormData();
    }
    $('#success-modal').modal({
      fadeDuration: 300
    });

    var transactionKey = JSON.parse(sessionStorage.getItem('transactionKey'));
    if(transactionKey) {
      firebase.database().ref('donations').child(transactionKey.key).once('value', function(snapshot){
        snapshot.ref.update({'creaditCardStatus': result.UMstatus}, function(){
          console.log('done')
        });
      })
    }
  }

  function fillInFormData(){
    var lsData = localStorage['formData']
    
    if(lsData){
      var data = JSON.parse(lsData);
      var form = $('form.donation-form').find('input, textarea').each(function(){
        var input = $(this)
        var name = input.attr('name');
        input.val(data[name])
        updateTotalValue(amountInput.val());
      });
      $('html, body').animate({
        scrollTop: $(".donate-form_section--66").offset().top
      }, 1000);
    }
    
  }

  function deleteFormData(){
    localStorage.removeItem('formData');
  }

  function saveFormData(e){
    var data = $(e.target).serializeObject();
    localStorage['formData'] = JSON.stringify(data);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth',
        block: "start",
        inline: "nearest"
      });
    });
  });

  $('.footer-column_feedback').click(function(e) {
    $('#feedback-form').modal({
      fadeDuration: 300
    });
  });
});

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name]) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
};

Number.prototype.formatMoney = function(c, d, t){
  var n = this, 
  c = isNaN(c = Math.abs(c)) ? 2 : c, 
  d = d == undefined ? "." : d, 
  t = t == undefined ? "," : t, 
  s = n < 0 ? "-" : "", 
  i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
  j = (j = i.length) > 3 ? j % 3 : 0;
 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};




require('./libraries/sticky-header.js');

require('../scss/style.scss');
