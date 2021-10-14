//┌────────────────────────────────────────────────────────────────────────────┐
//│ [i18n_populate] FORM ➔ i18n {key , value} ........... _TAG (211014:14h:22) │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  populate_lang_key_val_json, i18n_translate */
/* globals  console, document, setTimeout */ // eslint-disable-line no-unused-vars
/* eslint-disable no-warning-comments */
/*
/*}}}*/

let i18n_populate = (function() {
"use strict";

const TAG_I18N = true;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ INPUT UI                                                                  │
// └───────────────────────────────────────────────────────────────────────────┘
/*{{{*/
const I18N             = "i18n"          ;

const SUBJECT          = "subject"       ;
const QUESTION         = "question"      ;







const FEEDBACK_GOOD    =  "good"         ;
//nst FEEDBACK_CORRECT =  "correct"      ;
//nst FEEDBACK_WRONG   =  "wrong"        ;
const FEEDBACK_BAD     =  "bad"          ;

const COMMENT          = "comment"       ;



const THANK_YOU_ACK_MS = 1000;

/*}}}*/
/* FORM {{{*/
let          form_div;
let            submit;
let             purge;
//t         qcm_panel;
//t    feedback_panel;
//t      status_panel;

/* FORM POST SUBMIT PARAMS */
//t     user_id_input;
//t        lang_input;

let     subject_input;
let    question_input;
//t question_id_input;
//t    qcm_rank_input;

//t    feedback_input;
//t        good_input;
//t     correct_input;
//t       wrong_input;
//t         bad_input;

let     comment_input;

/*}}}*/

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ POPULATE [lang, key, val]                             .. sync ON SUBMIT │
  // └─────────────────────────────────────────────────────────────────────────┘
/*➔ populate_GUI {{{*/
let populate_GUI = function()
{
//{{{
let log_this=false;

if(log_this) console.log("populate_GUI");
//}}}

    /* 1. CREATE GUI */
    /* [populate_div] {{{*/
    let populate_div = document.getElementById("populate_div");
    if(!populate_div)
    {
        /* eslint-disable quotes */
        let error_div
            = document.createElement("DIV");

        error_div.innerHTML
            = "<h3>Server-side error</h3>"
            + '<span>THIS PAGE TEMPLATE IS MISSING THE <em>populate_div</em> GUI CONTAINER</span>'
        ;
        error_div.style = "color:red; font-family:cursive; font-style:oblique;";

        document.body.appendChild( error_div );

        return;
        /* eslint-enable quotes */
    }
    /*}}}*/

    /* 2. GUI [innerHTML] */
    /*{{{*/
    /* [lang] COOKIES {{{*/
//console.log("populate_GUI")

    let lang       = _get_cookie("lang"   );

    let innerHTML  = "";
    /*}}}*/
    /* [populate_lang_key_val_json] .. f(is undefined) {{{*/
    if(typeof populate_lang_key_val_json == "undefined")
    {
        innerHTML
=` <pre style='color:red; font-style:oblique; font-family:cursive;'>
*** No translations pending ***
</pre>
<ul>

<!-- <li>   lang=[${    lang }]</li> -->
</ul>
`;

    }
    /*}}}*/
    /* [lang key values] {{{*/
    else {
//console.log("Object.keys(populate_lang_key_val_json).length=["+Object.keys(populate_lang_key_val_json).length+"]")
//console.dir(populate_lang_key_val_json)
        for(let l=0; l < Object.keys(populate_lang_key_val_json).length; ++l)
        {
            let   subject = Object.keys(populate_lang_key_val_json)[l];
//console.log(subject);
            let questions = Object.keys(populate_lang_key_val_json[subject]);
//console.log("questions:");
//console.dir( questions );

            let       sid = SUBJECT+(l+1);
            innerHTML += populate_subject(sid, subject, questions);
        }
    }
    /*}}}*/
    /*}}}*/
    /* [populate_div.innerHTML] {{{*/
    populate_div.innerHTML
        = "<button onclick='location.reload();' title='Reload'>&#x267b;</button>"
        + "<a href='/server_index.html' target='server_index'>➔ server_index</a>"
        + "<ol>"
        +   innerHTML
        + "</ol>";

    /*}}}*/

    setTimeout(() => i18n_translate.set_lang(lang, "FROM [populate_GUI]"), 1000);
    setTimeout(() => i18n_translate.sync_i18n_elements()                 , 1000);
};
/*}}}*/
/*_ populate_subject {{{*/
let populate_subject = function(sid, subject, questions)
{
//console.log("populate_subject(sid=["+sid+"], subject=["+subject+"], questions=["+questions+"])")
    let innerHTML  = "";
    let translated =  0;


    for(let q=0; q<questions.length; ++q)
    {
        let        question = questions[q];

        if(typeof  question == "object") {
            innerHTML     += populate_subject(sid+(q+1)     , question);
        }
        else {
            let        qid = sid+"_q"+(q+1);
            //t      label = i18n_translate.get_i18n(         question);
            let      label =                                  question ; /* DO NOT TRANSLATE */
            let      value = get_user_value        ( subject, question);
            let  className = QUESTION+ " "+(value ? FEEDBACK_GOOD : FEEDBACK_BAD);
            let data_topic = escape( JSON.stringify( { subject, question, value }) );
//{{{
//console.log("data_topic=["+unescape(data_topic)+"]")
//console.log("value=["+value+"]")
//}}}

            innerHTML += `<li id="${qid}" class="${className}" data-topic='${data_topic}'>${label}</li>`;

            translated += (value) ? 1 : 0;
        }
    }

    let summary_innerHTML
        = get_summary_innerHTML(subject, sid, translated, questions.length);
//console.log("summary_innerHTML=["+summary_innerHTML+"]")

    return "<li>"
        +   "<details>"
        +    "<summary>"+summary_innerHTML+"</summary>"
        +    "<ol>"
        +     innerHTML
        +    "</ol>"
        +   "</details>"
        +  "</li>"
    ;

};
/*}}}*/
/*_ get_summary_innerHTML {{{*/
let get_summary_innerHTML = function(subject, sid, translated, questions_length)
{
    let className = (translated >= questions_length) ? "good" : "wrong";
    return "<b id='"+sid+"'class='"+ subject+"'>"+ subject
        +  "   <em class='good'                >"+ translated       +"</em>"
        +  " / <em class='"+className+"'       >"+ questions_length +"</em>"
        +  "</b>"
    ;
};
/*}}}*/
/*_ sync_subject_summary {{{*/
let sync_subject_summary = function(subject)
{
    let questions  = Object.keys(populate_lang_key_val_json[subject]);

    /* bad_count {{{*/
    let bad_count  = questions.length;

//console.log(" bad_count=["+ bad_count+"]")
    /*}}}*/
    /* bad_count {{{*/
    let good_count = 0;
    for(let q=0; q<questions.length; ++q)
    {
        let        question = questions[q];
        let        value    = get_user_value(subject, question);

        good_count += (value) ? 1 : 0;
    }
//console.log("good_count=["+good_count+"]")
    /*}}}*/


    let summaries = document.getElementsByTagName("SUMMARY");
    for(let i=0; i < summaries.length; ++i)
    {
        let summary = summaries[i];
        let b = summary.firstElementChild;
        if( b.classList.contains(subject) )
        {
//console.log("summary=["+summary.innerHTML+"]")

            let el_good       =  b      .firstElementChild;
            let el_bad        =  el_good.nextElementSibling;
            el_good.innerText = good_count;
            el_bad .innerText = bad_count;

//console.log("summary=["+summary.innerHTML+"]")
        }
    }
};
/*}}}*/
/*_ _get_cookie {{{*/
let _get_cookie = function(key)
{
    let    value = "";
    let  cookies = document.cookie.split(";");
    let param_EQ = key+"=";
    for(let i=0; i < cookies.length; ++i)
    {
        let s = cookies[i].trim();
        if( s.indexOf(param_EQ) == 0)
        {
            value = s.substring(param_EQ.length, s.length)
                .     replace(/'/g,"")
                .     replace(/"/g,"");
            break;
        }
    }
//console.log("_get_cookie("+key+") ...return ["+value+"]");
    return value;
};
/*}}}*/

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ SHOW HIDE                                                                 │
// └───────────────────────────────────────────────────────────────────────────┘
/*➔ form_div_onclick .. (i18n_populate.html onclick) {{{*/
let form_div_onclick = function(event) /* eslint-disable-line complexity */
{
//{{{
let log_this=false;

if(log_this) console.log("form_div_onclick");
//}}}
//{{{
if(log_this) console.log("form_div_onclick");
if(log_this) console.dir(event);
if(log_this) console.log("srcElement=["+(event.srcElement.id ? event.srcElement.id : event.srcElement.type)+"]");
if(log_this) console.log("....target=["+(event.target.id     ? event.target.id     : event.target.type    )+"]");
//}}}
    /* GET [form_div] {{{*/
    if(!form_div) get_form_div();

    form_div.style.display = "block";
    /*}}}*/
    /* [e_target] {{{*/
    let e_target = event.target;

//{{{
if(log_this) console.log("form_div.parentElement"); // the attached to question
if(log_this) console.dir( form_div.parentElement );
if(log_this) console.log("e_target ["+e_target.className+"]");
if(log_this) console.dir( e_target                          );
//}}}
    /*}}}*/
//debugger;
    /* form_div INPUT {{{*/
    if(is_el_child_of_id(e_target, "form_div"))
    {
        // SYNC FORM [hidden] INPUT .. @see ../CLIENT/feedback_tree.js

        return;
    }
    let hiding
        =  (!e_target.classList.contains(QUESTION))
        || (form_div.parentElement == e_target);

/*{{{*/
if(log_this) console.log("hiding=["+hiding+"]");
if(log_this) console.log("form_div.parentElement");
if(log_this) console.dir( form_div.parentElement );
if(log_this) console.log("e_target");
if(log_this) console.dir( e_target );
/*}}}*/
    /*}}}*/
    /* HIDE .. (by removing from parentElement) {{{*/
    if( hiding )
    {
        if( form_div.parentElement )
            form_div.parentElement.removeChild( form_div );

//          form_div.style.display = "none";
    }
    /*}}}*/
    /* SHOW .. (POPULATE DIALOG WITH TO-BE-SUBMITTED DATA) {{{*/
    else {
        /* FOCUS GUI WHEN DONE .. (after this function has ended) {{{*/
        setTimeout(() => {
            comment_input.focus();
            comment_input.selectionEnd   = comment_input.value.length;
            comment_input.selectionStart = 0; }, 0);

        /*}}}*/
//debugger;
        /* LOAD PARAMS AND INSERT FORM INTO DOM {{{*/
        let lang       = i18n_translate.get_lang();
if(log_this) console.log("lang=["+lang+"]");

        let data_topic = unescape(event.target.getAttribute("data-topic"));
if(log_this) console.log("data_topic=["+data_topic+"]");

        let { subject, question } = JSON.parse( data_topic );
if(log_this) console.log("data_topic=["+data_topic+"]");

        form_div_onclick_LOAD({ lang, subject, question });

        e_target.appendChild(form_div, e_target.lastElement);
        /*}}}*/
        // SYNC WITH (possibly changed) [lang] {{{*/
        // .. that may have changed (while hiding i.e. when this form was removed from the DOM)
        // search and sync its children elements
        // once appended back into the DOM (where document can search for them)
        let el_array
            =   Array.from( document.querySelectorAll    ("#form_div ."+I18N    ) )
//{{{
// TRANSLATE MORE ?
//              .concat(Array.from( form_div.getElementsByTagName("LABEL"               ) ))
//              .concat(Array.from( document.querySelectorAll    ("#form_div ."+SUBJECT ) ))
//              .concat(Array.from( document.querySelectorAll    ("#form_div ."+QUESTION) ))
//}}}
        ;
//{{{
if(log_this) console.log("form_div .. el_array.length=["+el_array.length+"]");
//}}}
        if(el_array.length)
            i18n_translate.sync_i18n_elements( el_array );

        /*}}}*/
    }
    /*}}}*/
};
/*}}}*/
/*_ form_div_onclick_LOAD {{{*/
let form_div_onclick_LOAD = function({lang, subject, question}) /* eslint-disable-line no-unused-vars */
{
/*{{{*/
let log_this=false;

if(log_this) console.log("%c form_div_onclick_LOAD: ["+lang+"] .. ["+subject+"] .. ["+question+"]", "border: 3px solid green;");

/*}}}*/
    /* REOPENING SAME ENTRY {{{*/
    if(    (subject_input .value == subject )
        && (question_input.value == question)
      ) {
if(TAG_I18N) console.log("..REOPENING ["+ question_input.value +"] QUESTION");

        return;
    }
    /*}}}*/
    /* RESET ALL FORM-INPUT  {{{*/
    form_div_reset();

    comment_monitor();

    if(!subject || !question) return;

    /*}}}*/
    /* LOAD FORM SUBMIT PARAM ➔ [subject question comment] {{{*/
    let               comment = get_user_value(subject, question);

    /**/     subject_input.value =                  subject  ? subject  : "";
    /**/    question_input.value =                  question ? question : "";

    /**/     comment_input.value =                 (comment || "");
//  /**/        lang_input.value =                  lang     ? lang     : "";

if(TAG_I18N) console.log("....OPENING ["+ question_input.value +"] QUESTION");
    /*}}}*/



    /* [purge] button {{{*/
    let can_purge = true; /* CAN ALWAYS DELETE A QUESTION */

    if( can_purge ) {
        purge .classList.remove("disabled");
        purge .disabled        = false;
    }
    /*}}}*/
    /* [comment_input] .. COLORIZE EARLIER LOADED FEEDBACK-LEVEL {{{*/
    comment_input      .value
        = comment_input.value
        . replace ( /''/gm , "'"  ) /* SINGLE_QUOTE(x2) ➔ (x1) */
        . replace ( /""/gm , '"'  ) /* DOUBLE_QUOTE(x2) ➔ (x1) */ /* eslint-disable-line quotes */
        . replace (/\\r/gm , ""   ) /* CR */
        . replace (/\\n/gm , "\n" ) /* LF */
    ;

    let has_comment = (comment);

    comment_input.style.backgroundColor
        = has_comment
        ?  "rgba(255,255,192,0.5)"
        :  "";

    comment_monitor();
    /*}}}*/
};
/*}}}*/
/*_ get_form_div {{{*/
let get_form_div = function()
{
//console.log("get_form_div")
//  user_id_input           = document.getElementById( "user_id" );
//  lang_input              = document.getElementById( "lang"    );

    form_div                = document.getElementById( "form_div");
    form_div.addEventListener("submit", form_div_submit_handler);

    submit                  = document.getElementById( "button_submit"  );
    purge                   = document.getElementById( "button_purge"   );

    /* [panel] {{{*/

    /*}}}*/

    /* [input] {{{*/
    /**/      subject_input = document.getElementById( SUBJECT          );
    /**/     question_input = document.getElementById( QUESTION         );

    /**/      comment_input = document.getElementById( COMMENT          );
    /*}}}*/

    /* LOAD PARAMS [user_id] and [lang] {{{*/
//  user_id_input.value     = _get_cookie("user_id");
//  lang_input   .value     = _get_cookie("lang"   );

//  user_id_input.value     = user_id;
//  lang_input   .value     = lang   ;
    /*}}}*/
};
/*}}}*/
/*_ form_div_reset {{{*/
let form_div_reset = function()
{
    submit       .classList.add   ("disabled"   );  submit.disabled = true;
    purge        .classList.add   ("disabled"   );  purge .disabled = true;
    comment_input.classList.remove("mandatory"  );
    comment_input.classList.remove("min_reached");

//  /**/    good_input.checked = false;
//  /**/ correct_input.checked = false;
//  /**/   wrong_input.checked = false;
//  /**/     bad_input.checked = false;
};
/*}}}*/
/*_ get_user_value {{{*/
let get_user_value = function(subject, question)
{
    let value
        =  populate_lang_key_val_json[subject]           /* lang     */
        ?  populate_lang_key_val_json[subject][question] /* lang_key */
        :  "";

    value = value .replace(/'/gm,"’");
    return  value;
};
/*}}}*/
/*_ is_el_child_of_id {{{*/
let is_el_child_of_id = function(el, id)
{
    while(el && (el.id != id) && (el = el.parentElement)) // eslint-disable-line no-param-reassign
        ;
    return (el != null);
};
/*}}}*/

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ SUBMIT                                                                    │
// └───────────────────────────────────────────────────────────────────────────┘
/*_ form_div_submit_handler {{{*/
let form_div_submit_handler = function(event)
{
/*{{{*/
//console.dir(event);
//
//console.log("event.srcElement:")
//console.dir( event.srcElement  )
//
//console.log("event.submitter:")
//console.dir( event.submitter  )
//
//console.log("event.submitter.formAction...=["+event.submitter.formAction+"]")
//console.log("event.submitter.formTarget...=["+event.submitter.formTarget+"]")
//
//console.log("form_div")
//console.dir( form_div )
//
//console.log("form_div.parentElement")
//console.dir( form_div.parentElement )
/*}}}*/
    /* [action] [subject,question] {{{*/
    let action
        =  (  !event.submitter
            || event.submitter.formAction.includes("submit"))
        ? "submit"
        : "purge";

    let subject  = subject_input .value;
    let question = question_input.value;

//console.log("%c form_div_submit_handler: action=["+action+"] subject=["+ subject +"] question=["+ question +"]", "color:cyan;")
    /*}}}*/
    /* SUBMIT [dialog_form] {{{*/
//      let form = event.srcElement;
    let form = document.forms.dialog_form;

//console.log("form:")
//console.dir( form  )

//console.log("form.submit:")
//console.dir( form.submit  )

    let comment
        = comment_input.value
        .  replace(/'/gm      ,"’") // replace apos
        .  replace(  /\s+$/gm,  "") // trim EOL
        .  replace(/(\n|\r)/gm," ") // one-liner
        .  trim();
    comment_input.value = comment;
//console.log("%c comment=["+comment+"]", "color:orange;")

    form.target = "response_iframe";
//console.log("form.target.submit():")
//console.dir( form.target  )
    form.submit();

    /*}}}*/
    /* UPDATE [subject,question] ENTRY [populate_lang_key_val_json] {{{*/
    let updated_item;
    if(typeof populate_lang_key_val_json != "undefined")
    {
        /* GET [subject][question] ITEM {{{*/
//console.log("populate_lang_key_val_json["+subject+"] (x"+Object.keys(populate_lang_key_val_json[subject]).length+")")

        let item
            =  populate_lang_key_val_json[subject]           /* lang     */
            ?  populate_lang_key_val_json[subject][question] /* lang_key */
            :  null;
//console.log("typeof item: "+typeof item)

            updated_item = item;
        /*}}}*/
            /* 1/2 PURGE ITEM {{{*/
            if(action == "purge")
            {
                /* DELETE ITEM {{{*/
//console.log("..."+action+": delete populate_lang_key_val_json["+subject+"]["+question+"]")
                delete         populate_lang_key_val_json[  subject  ][  question ];

                /*}}}*/
            }
            /*}}}*/
            /* 2/2 SUBMIT ITEM {{{*/
            else {
//console.log("..."+action+": updating populate_lang_key_val_json["+subject+"]["+question+"]")

                populate_lang_key_val_json[subject][question] = comment; // key, val
            }
            /*}}}*/
        /* SYNC [subject] SUMMARY {{{*/
        sync_subject_summary( subject );

        /*}}}*/
    }
//console.log("updated_item:")
//console.dir( updated_item  )
    if((action != "purge") && (updated_item != null))
    {
//console.log("..."+action+": updating populate_lang_key_val_json["+subject+"]["+question+"]:")

        if(typeof populate_lang_key_val_json != "undefined")
        {
            populate_lang_key_val_json[subject][question] = comment;

//console.log(                               subject           )
//console.log(                                       [question])
//console.log(    populate_lang_key_val_json[subject][question])
        }
    }
    /*}}}*/
    /* RESET FORM [purge] {{{*/
    if(action == "purge")
    {
//console.log("..."+action+": RESETTING form_div")

        /* FEEDBACK DATA */
//
//
//
//

        /**/ comment_input.value   = "";

        /* FEEDBACK UI */
        submit .classList.add("disabled"); submit.disabled = true;
        purge  .classList.add("disabled"); purge .disabled = true;

        comment_input.style.backgroundColor = "";
    }
    /*}}}*/
    /* HIDE FORM DIV {{{*/
    if(typeof populate_lang_key_val_json != "undefined")
    {
        setTimeout(function() {
            if( form_div.parentElement )
                form_div.parentElement.removeChild( form_div );
        }, (action == "purge") ? 200 : THANK_YOU_ACK_MS);
    }

    /*}}}*/
    /* SYNC [question value] {{{*/
    sync_populate(action, subject, question, comment);

    /*}}}*/

//console.log("populate_lang_key_val_json")
//console.dir( populate_lang_key_val_json )

  //document.location.reload();
};
/*}}}*/
/*_ sync_populate {{{*/
let sync_populate = function(_action, _subject, _question, _value)
{
//console.log("%c sync_populate(_action=["+_action+"] _subject=["+_subject+"]  _question=["+_question+"]  _value=["+_value+"]", "background-color:navy;")

    let el_array = Array.from( document.querySelectorAll(".question") );
//console.log("el_array querySelectorAll(form_div .question):")
//console.dir( el_array )

    let value = (_action == "purge") ? "" : _value;
//console.log("value=["+value+"]")

    for(let i = 0; i < el_array.length; ++i)
    {
        let el = el_array[i];

        let data_topic = unescape(el.getAttribute("data-topic"));
//console.log("data_topic=["+data_topic+"]")

        let {subject, question} = JSON.parse( data_topic );
//console.log("subject=["+subject+"] .. question=["+question+"]")

        if( subject  != _subject  ) continue;
        if( question != _question ) continue;

//console.log("el")
//console.dir( el )

        /* CLEAR el CSS {{{*/
        el.classList.remove(FEEDBACK_GOOD      );
//
//
        el.classList.remove(FEEDBACK_BAD       );

        /*}}}*/
        /* UPDATE [value] {{{*/
        data_topic = escape( JSON.stringify({ subject, question, value }));
//console.log("data_topic=["+data_topic+"]")
        el.setAttribute("data-topic", data_topic);

        /*}}}*/
        /* SYN el CSS {{{*/
        if(_action != "purge")
        {
            /* SYNC CSS */
            if(value) el.classList.add( FEEDBACK_GOOD );
//
//
            else      el.classList.add( FEEDBACK_BAD  );
        }
        /*}}}*/
        /* OR REMOVE el {{{*/
        else {
           // ➔ Form submission canceled because the form is not connected {{{
           // ┌──────────────────────────────────────────────────────────┐
           // │ ...do not disconnect the submitted form too quick!       │
           // │ ..as it is contained by this question el                 │
           // └──────────────────────────────────────────────────────────┘ }}}
            setTimeout(() => el.parentElement.removeChild(el), 500);

        }
        /*}}}*/
    }
};
/*}}}*/

// ┌───────────────────────────────────────────────────────────────────────────┐
// │ EVENT                                                                     │
// └───────────────────────────────────────────────────────────────────────────┘
/*➔ comment_monitor {{{*/
/*{{{*/
const LF = String.fromCharCode(10); /* eslint-disable-line no-unused-vars */

let ta_status;
/*}}}*/
let comment_monitor = function(event)
{
//console.log("comment_monitor")

    if(!comment_input) return;

    /* ENTER ➔ SUBMIT FORM {{{*/
    let has_LF = comment_input.value.includes( LF );
    if( has_LF )
    {
        form_div_submit_handler(event);
        return;
    }
    /*}}}*/
    /* [ta_status] {{{*/
    if(!ta_status)
        ta_status = document.getElementById("ta_status");

    if(!ta_status) {
        ta_status    = document.createElement("EM");
        ta_status.id = "ta_status";
        comment_input.parentElement.appendChild(ta_status);
    }
    /*}}}*/
    /* UPDATE {{{*/
    if(event) {
        /* validation params {{{*/
        let warn_length =  comment_input.maxLength - 32;
        let min_reached = (comment_input.value.length >= comment_input.minLength);
        let max_reached = (comment_input.value.length >= comment_input.maxLength);
        let red_reached = (comment_input.value.length >= warn_length       );

        let count_down  = (comment_input.minLength+" < "+comment_input.value.length +" < "+comment_input.maxLength);

        let available
            = (red_reached && !max_reached)
            ?  "oooooooooooooooooooooooooooooooo".substring(0,comment_input.maxLength - comment_input.value.length)
            :  "";

        /*}}}*/
        /* validation status {{{*/
        ta_status.innerText
            = count_down +" "+ available;

        ta_status.style.color
            = !min_reached ?    "red"
            :  max_reached ? "yellow"
            :  red_reached ?    "red"
            :                  "gray";

        ta_status.style.backgroundColor
            =  max_reached ?    "red"
            :           "transparent";

        /*}}}*/
    }
    /*}}}*/
    /* OR RESET {{{*/
    else {
//console.log("RESET COMMENT")

//      comment_input.value = "";
        comment_input.classList.remove("mandatory"  );
        comment_input.classList.remove("min_reached");

        if(ta_status) ta_status.innerText = "";
    }
    /*}}}*/

    form_div_sync(event);
};
/*}}}*/
/*➔ form_div_sync .. (disable submit purge) .. (comment mandatory min_reached) {{{*/
let form_div_sync = function(event)
{
/*{{{*/
let log_this=false;

if(log_this) console.log("%c form_div_sync", "border:1px solid #EFE;");
/*}}}*/

    if(!submit) return; // TOO EARLY

    /* RESET FORM and return .. (!event) {{{*/
    if(!event) {
if(log_this) console.log("RESET FORM");

        submit       .classList.add   ("disabled");     submit.disabled =  true;
        purge        .classList.remove("disabled");     purge .disabled = false; // can delete entry
        comment_input.classList.remove("mandatory"  );
        comment_input.classList.remove("min_reached");

//
//
//
//

        return;
    }
    /*}}}*/
    /* [need_comment] {{{*/
    let need_comment =  !(comment_input.value);
if(log_this) console.log("need_comment=["+need_comment+"]");

    if( need_comment )  comment_input.minLength =   1;
    else                comment_input.minLength =   0;
if(log_this) console.log("comment_input.minLength=["+comment_input.minLength+"]");
    /*}}}*/
    /* BLINK GUI .. f((some_checked required) .. @see ../CLIENT/feedback_tree.js {{{*/

    //}}}
    /* [min_reached] .. [can_submit] [can_purge] {{{*/
    let min_reached  = (comment_input.value.length >= comment_input.minLength);
if(log_this) console.log("comment_input.value.length=["+comment_input.value.length+"]");

    let can_submit   = (!need_comment || min_reached);
    let can_purge    =  true; // can delete entry

if(log_this) console.log(".....can_submit=["+ can_submit +"]");
if(log_this) console.log("......can_purge=["+ can_purge  +"]");
    /*}}}*/
    /* [submit] [purge] ... [  disable .. enable   ] {{{*/
    if(can_submit)      { submit.classList.remove ("disabled");  submit.disabled = false; }
    else                { submit.classList.add    ("disabled");  submit.disabled =  true; }

    if(can_purge )      { purge .classList.remove ("disabled");  purge .disabled = false; }
    else                { purge .classList.add    ("disabled");  purge .disabled =  true; }
    /*}}}*/
    /* [comment_input] .. [mandatory .. minLength] {{{*/
    if(need_comment)    comment_input.classList.add   ("mandatory"  );
    else                comment_input.classList.remove("mandatory"  );

    if(min_reached )    comment_input.classList.add   ("min_reached");
    else                comment_input.classList.remove("min_reached");

    /*}}}*/
};
/*}}}*/

    return { populate_GUI
        ,    form_div_onclick
        ,    comment_monitor
        ,    form_div_sync



    };
})();

setTimeout( i18n_populate.populate_GUI, 500); /* onload */

