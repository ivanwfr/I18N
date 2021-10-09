//┌────────────────────────────────────────────────────────────────────────────┐
//│ [feedback_tree] FORM ➔ {subjects , questions, qcm} .. _TAG (211009:16h:53) │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  feedback_topics_json, i18n_translate */
/* globals  console, document, setTimeout */ // eslint-disable-line no-unused-vars
/* eslint-disable no-warning-comments */

/*}}}*/
//{{{
//┌────────────────────────────────────────────────────────────────────────────┐
//│ NOTE                                                                       │
//├────────────────────────────────────────────────────────────────────────────┤
//│                                                                            │
//│ feedback_topics_json   ➔ [JS server-generated-topics]                      │
//├                                                                            ┤
//│ feedback_items_array   ➔ [subject   .. sid_array .. qid_array .. questions │
//│                           qcm_array .. rnk_array .. comments]              │
//├                                                                            ┤
//│ feedback_replies_json  ➔ [subject   .. sid       .. qid       .. question  │
//│                           qcm_rank  .. comment   .. feedback]              │
//├                                                                            ┤
//│ feedback_replies_array ➔ === [feedback_replies_json]                       │
//│                        ➔ or a generated array from destructuring           │
//│                          a [subject_id-version] of [feedback_topics_json]  │
//│                                                                            │
//└────────────────────────────────────────────────────────────────────────────┘
//}}}
let feedback_tree = (function() {
"use strict";
let   TAG_TREE = false; // TOGGLED ON FROM A PAGE SUCH AS document.location.href.includes("dev");;
  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ INPUT UI                                                            │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*{{{*/
const I18N             = "i18n"          ;

const SUBJECT          = "subject"       ;
const QUESTION         = "question"      ;
const QUESTION_ID      = "question_id"   ;
const QCM_RANK         = "qcm_rank"      ;

const QCM_PANEL        = "qcm_panel"     ;

const FEEDBACK_PANEL   = "feedback_panel";
const FEEDBACK         = "feedback"      ;
const FEEDBACK_GOOD    =  "good"         ;
const FEEDBACK_CORRECT =  "correct"      ;
const FEEDBACK_WRONG   =  "wrong"        ;
const FEEDBACK_BAD     =  "bad"          ;

const COMMENT          = "comment"       ;

const STATUS_PANEL     = "status_panel"  ;

const THANK_YOU_ACK_MS = 1000;

/*}}}*/
/* FORM {{{*/
let          form_div;
let            submit;
let             purge;
let         qcm_panel;
let    feedback_panel;
let      status_panel;

/* FORM POST SUBMIT PARAMS */
let     user_id_input;
let        lang_input;

let     subject_input;
let    question_input;
let question_id_input;
let    qcm_rank_input;

let    feedback_input;
let        good_input;
let     correct_input;
let       wrong_input;
let         bad_input;

let     comment_input;

/*}}}*/

  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ POPULATE [subject questions feedback comment] .. sync ON SUBMIT     │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*➔ populate_GUI {{{*/
let populate_GUI = function()
{
//{{{
let log_this=false;

if(log_this) console.log("populate_GUI");
//}}}
    TAG_TREE ||= document.location.href.includes("dev");

    /* 1. GET PARAMETERS [user_id] [lang] */
    let { user_id , lang } = populate_get_user_id_lang();

    /* 2. CREATE [feedback_div] GUI or FAIL WITH [error_div] */
    /* [feedback_div] {{{*/
    let feedback_div = document.getElementById("feedback_div");
    if(!feedback_div)
    {
        let title = "Server-side error";
        let   msg = "THIS PAGE TEMPLATE IS MISSING THE <em>feedback_div</em> GUI CONTAINER";
        populate_show_error_div(title, msg);

        console.log("%c "+msg, "background-color: #D00; font-size:150%; border:3px solid #F00;");
        return;
    }

    let innerHTML  = "";
    /*}}}*/

    /* 3. BUID GUI [innerHTML] */
    /*{{{*/
    /* MISS [user_id] {{{*/
    if(!user_id )
    {
        innerHTML
=` <pre style='color:red; font-style:oblique; font-family:cursive;'>
*** user_id is undefined ***
➔ feedback_tree
➔➔ populate_GUI
</pre>
<ul>
<li>user_id=[${ user_id }]</li>
<li>   lang=[${    lang }]</li>
</ul>
`;

    }
    /*}}}*/
    /* MISS [feedback_topics_json) {{{*/
    else if(typeof feedback_topics_json == "undefined")
    {
//console.log('(typeof feedback_topics_json == "undefined")')

        innerHTML
=` <pre style='color:red; font-style:oblique; font-family:cursive;'>
*** No feedback topics defined ***
➔ feedback_tree
➔➔ populate_GUI
</pre>
<!--<ul>
<li>user_id=[${ user_id }]</li>
<li>   lang=[${    lang }]</li>
</ul>-->
`;

    }
    /*}}}*/
    /* SHOW TOPICS [subject questions] {{{*/
    else {
        populate_get_feedback_items_array();

        for(let i=0; i < feedback_items_array.length; ++i)
        {
            let      feedback_item = feedback_items_array[i];
            let   subject =          feedback_item.subject  ; // string
            let questions =          feedback_item.questions; // string array
            let       sid = SUBJECT+(i+1);

            innerHTML += populate_subject(sid, subject, questions);
        }
    }
    /*}}}*/
    /*}}}*/

    /* 4. DISPLAY TOPICS [feedback_div.innerHTML] */
    /*{{{*/
    get_form_div(user_id,lang);

    feedback_div.innerHTML
        = "<ul>"
        +   innerHTML
        + "</ul>";

    /*}}}*/

    /* 5. TRANSLATE GUI [I18N] CONTENT [optional] */
    /*{{{*/
    if(typeof            i18n_translate != "undefined")
    {
        setTimeout(() => i18n_translate.set_lang(lang, "FROM [populate_GUI]"), 1000);
        setTimeout(() => i18n_translate.sync_i18n_elements()                 , 1000);
    }
    /*}}}*/

};
/*}}}*/
/*_ populate_get_user_id_lang {{{*/
let populate_get_user_id_lang = function()
{
//{{{
let log_this=false;

if(log_this) console.log("populate_get_user_id_lang");
//}}}
    /* [user_id] [lang] ➔ GET FROM LOCATION URL-PARAM {{{*/
if(TAG_TREE) console.groupCollapsed("%c [user_id] [lang] ➔ FROM LOCATION URL PARAM OR FROM COOKIE:", "border: 3px solid #888; font-size:150%;");
//console.log("document.location");
//console.log( document.location );

    let user_id_location_param = document.location.href.replace(/.*user_id=([^\&]+).*/, "$1");
    let    lang_location_param = document.location.href.replace(   /.*lang=([^\&]+).*/, "$1");

if(TAG_TREE) console.log("%c ➔ user_id_location_param.=["+ user_id_location_param +"]", "border: 3px solid  yellow; font-size:150%;");
if(TAG_TREE) console.log("%c ➔    lang_location_param.=["+    lang_location_param +"]", "border: 3px solid  yellow; font-size:150%;");
    /*}}}*/
    /* [user_id] [lang] ➔ GET FROM COOKIE {{{*/

    let user_id_cookie_value   = _get_cookie("user_id");
    let    lang_cookie_value   = _get_cookie("lang"   );

if(TAG_TREE) console.log("%c ➔ user_id_cookie_value...=["+ user_id_cookie_value   +"]", "border: 3px solid  orange; font-size:150%;");
if(TAG_TREE) console.log("%c ➔    lang_cookie_value...=["+    lang_cookie_value   +"]", "border: 3px solid  orange; font-size:150%;");
    /*}}}*/
    /* [user_id] [lang] ➔ CHOOSE PARAM OR COOKIE {{{*/
    let user_id   = user_id_location_param ? user_id_location_param : user_id_cookie_value;
    let    lang   =    lang_location_param ?    lang_location_param :    lang_cookie_value;
if(TAG_TREE) console.log("%c ➔ user_id................=["+ user_id_cookie_value   +"]", "border: 3px solid   green; font-size:150%;");
if(TAG_TREE) console.log("%c ➔    lang................=["+    lang_cookie_value   +"]", "border: 3px solid   green; font-size:150%;");

if(TAG_TREE) console.groupEnd();

    /*}}}*/
    return { user_id , lang };
};
/*}}}*/
/*_ populate_show_error_div {{{*/
let populate_show_error_div = function(title,msg)
{
    let error_div
        = document.createElement("DIV");

    error_div.style
        = "color:red; font-family:cursive; font-style:oblique;";

    error_div.innerHTML
        = "<h3>"+title+"</h3>"
        + "<span>"+msg+"</span>";

    document.body.appendChild( error_div );
};
    /*}}}*/
/*_ populate_get_feedback_items_array {{{*/
/*{{{*/
let feedback_items_array   = [];

let feedback_replies_array = []; // local instance eventually initialized from an optional global object

/*}}}*/
let populate_get_feedback_items_array = function populate_get_feedback_items_array()
{
//{{{
let log_this=false;

if(log_this) console.log("populate_get_feedback_items_array");
//}}}
    /* 1/4 - FEEDBACK ➔ IS ARRAY .. [feedback_items_array = feedback_topics_json] {{{*/
    if(     Array.isArray( feedback_topics_json )
        && (typeof         feedback_replies_json != "undefined")
      ) {
        feedback_replies_array = feedback_replies_json; /* eslint-disable-line no-undef */
        feedback_items_array   = feedback_topics_json;

if(TAG_TREE) console.log  ("%c 1/4 - FEEDBACK ➔ USER REPLIES RECEIVED ("+feedback_replies_array.length+")", "background-color: #040; font-size:150%; border:3px solid #0F0;");
    }
    /*}}}*/
    /* 2/4 - FEEDBACK ➔ ALREADY CONVERTED TO ARRAY {{{*/
    else if(feedback_items_array.length >  0)
    {
if(TAG_TREE) console.log  ("%c 2/4 - FEEDBACK ➔ ALREADY CONVERTED TO ARRAY" , "background-color: #880; font-size:150%; border:3px solid #FF0;");

    }
    /*}}}*/
    /* 3/4 - FEEDBACK ➔ [has subject_id] CONVERTING TO ARRAY {{{*/
    else if(      feedback_topics_json[0].subject_id != undefined )
    {
if(TAG_TREE) console.groupCollapsed("%c FEEDBACK ➔ [has subject_id] CONVERTING TO ARRAY", "background-color: #00D; font-size:150%; border:3px solid #00F;");

        populate_get_feedback_items_array_streamlined();
    }
    /*}}}*/
    /* 4/4 - FEEDBACK ➔ FORMAT MISMATCH {{{*/
    else {
        let title = "Server-side error";
        let   msg = "FEEDBACK ➔ FORMAT MISMATCH: <em>feedback_topics_json</em> has no subject_id";
        populate_show_error_div(title, msg);

        console.log("%c "+msg, "background-color: #D00; font-size:150%; border:3px solid #F00;");
    }
    /*}}}*/
};
/*}}}*/
/*_ populate_get_feedback_items_array_streamlined {{{*/
let populate_get_feedback_items_array_streamlined = function()
{
    Object.keys(feedback_topics_json)
        .forEach( (idx) => {
            let val         = feedback_topics_json[idx];
            let vid         = parseInt(val.subject_id ) ;
            let subject     = val.libelle;

            /* SANITIZE MISSING [subject ] */
            subject         = (subject  && subject  != "null") ? subject : "* subject"+vid;

if(TAG_TREE) console.groupCollapsed("%c"+subject, "font-size:120%;");

            let sid_array   = [];
            let qid_array   = [];
            let questions   = [];
            let qcm_array   = [];
            let rnk_array   = [];
            let comments    = [];

            Object.keys(val.questions)
                .forEach((k) => {

                    let question = val.questions[k];

                    let sid =      parseInt( question. subject_id ) ;
                    let qid =      parseInt( question.question_id ) ;
                    let lib =                question.libelle       ;
                    let qcm = Object.values( question.qcm          );
                    let rnk =                question.qcm_rank      ; // 0-based .. happened to be missing as of 210910
                    let cmt =                question.user_comment  ;

                    /* SANITIZE MISSING [question] */
                    lib = (lib && lib != "null") ? lib : "* subject"+sid+"_question"+qid;

                    /* SANITIZE MISSING [qcm] */
                    for(let i=0;  i < qcm.length; ++i)
                        qcm[i] = (qcm[i] && qcm[i] != "null") ? qcm[i] : "* subject"+sid+"_question"+qid+"_qcm"+i;

                    sid_array.push( sid );
                    qid_array.push( qid );
                    questions.push( lib );
                    qcm_array.push( qcm );
                    rnk_array.push( rnk );
                    comments .push( cmt );

//{{{
if(TAG_TREE) {
  console.log(sid+"."+qid+" %c["+             lib  +"]"  , "color:#FF0; background-color:#00A;");
  console.log(         "… qcm %c"+JSON.stringify(qcm)    , "color:#0BB;");
  console.log(         "… rnk %c"+JSON.stringify(rnk)    , "color:#B0B;");
  console.log(         "… cmt %c["+              cmt +"]", "color:#F0F;");
}
//}}}
                });

            feedback_items_array
                .push( { subject
                       , sid_array
                       , qid_array
                       , questions
                       , qcm_array
                       , rnk_array
                       , comments
                });

            for(let i=0; i<questions.length; ++i)
            {
                feedback_replies_array
                    .push( { subject
                           , sid      : sid_array[i]
                           , qid      : qid_array[i]
                           , question : questions[i] || "?"
                           , qcm      : qcm_array[i]
                           , qcm_rank : rnk_array[i]
                           , comment  : comments [i]
                           , feedback : undefined
                    });
            }
if(TAG_TREE) console.groupEnd();
        });

//{{{
if(TAG_TREE) {
  console.log("feedback_items_array:" );
  console.log( feedback_items_array   );
  console.log("feedback_replies_array:");
  console.log( feedback_replies_array  );
}

if(TAG_TREE) console.groupEnd();
//}}}
};
/*}}}*/
/*_ populate_subject {{{*/
let populate_subject = function(sid, subject, questions)
{
//{{{
let log_this=false;

if(log_this) console.log("populate_subject: "+sid+" .. questions( "+questions.length+" ) .. ["+subject+"]");
//}}}
    let className
        = I18N
        + ((subject.startsWith("*")) ? " sanitized" : "");

    let innerHTML = "<b class='"+className+" subject' id='"+sid+"'>"+ subject +"</b>";
    innerHTML    += "<ul>";
    for(let q=0; q<questions.length; ++q)
    {
        let        question = questions[q] || "";
//{{{
if(log_this) console.log("questions["+q+"]");
if(log_this) console.dir( question         );
//}}}
        /* 1/2 - ADD FORM [question] {{{*/
        if(typeof question != "object")
        {
            let user_feedback = get_user_feedback(subject, question, "populate_subject");
            let    data_topic = escape( JSON.stringify({ subject , question }));
//{{{
if(log_this) console.log("%c populate_subject: ➔ data_topic=["+unescape(data_topic)+"]", "border:1px solid red;");
if(log_this) console.dir(user_feedback);
//}}}

            let   qid = sid+"_q"+(q+1);

            let label = (typeof i18n_translate != "undefined")
                ?        i18n_translate.get_i18n(question)
                :        question;

            className = I18N
                +       " "+ get_qcm_className(user_feedback.qcm_rank, user_feedback.feedback, label)
                +       ((label.startsWith("*")) ? " sanitized" : "");

//{{{
if(log_this) console.log("➔ %c qid=["+qid+"] .. subject=["+subject+"] .. className=["+className+"] label=["+label+"]", "color:black; background-color: #FFD; border: 1px solid #FF0;");
//}}}

            innerHTML        += `
<li     id="${qid}"
     class="${className}"
data-topic='${data_topic}'
           >${label}</li>`;

        }
        /*}}}*/
        /* 2/2 - RECURSE INTO EMBEDDED [subject] {{{*/
        else {
            innerHTML        += populate_subject(sid+(q+1),question);

        }
        /*}}}*/
    }
    innerHTML    += "</ul>";

    return "<li>"+innerHTML+"</li>";
};
/*}}}*/
/*_ get_qcm_className {{{*/
let get_qcm_className = function(qcm_rank,feedback)
{
    let has_rank
        = !isNaN( parseInt(qcm_rank) );

    let className
        =     QUESTION
        +" "+ ( has_rank ? ("gradient"+(1+parseInt(qcm_rank)) )
              : feedback ? (                       feedback   )
              :            (                       ""         )
              );

//console.log("…qcm_rank=["+qcm_rank+"] feedback=["+feedback+"] ➔ className=["+className+"] ➔ label=["+label+"]");
    return className;
};
/*}}}*/

  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ [user_feedback]                                                     │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*_ get_user_feedback {{{*/
/*{{{*/
const regexp_NOWRD    = new RegExp("[^0-9~A-Za-z\\xC0-\\xFF]+"                , "g"); /* quantité */

/*}}}*/
let get_user_feedback = function(subject,question,_caller)
{
/*{{{*/
let log_this=false;

/*}}}*/
    let user_feedback = { subject , question };

    if(!subject || !question) return user_feedback;
    subject  = subject .replace(regexp_NOWRD, " ");
    question = question.replace(regexp_NOWRD, " ");
    for(let i=0; i < feedback_replies_array.length; ++i)
    {
        let             reply = feedback_replies_array[i];
        if( subject  != reply.subject .replace(regexp_NOWRD, " ")) continue;
        if(question  != reply.question.replace(regexp_NOWRD, " ")) continue;
        user_feedback = reply;
        break;
    }

/*{{{*/
let color
        = (Object.keys(user_feedback).length < 1) ? "#444"
        :                 _caller.startsWith("p") ? "#006"
        :                                           "#550";
let css   = "border: 5px solid "+color+";";

if(log_this)
{
    console.log("%c get_user_feedback: _caller=["+_caller+"]\n"
                +   "subject  = ["+ subject      +"]\n"
                +   "question = ["+ question     +"]\n"
                + JSON.stringify(   user_feedback )
                .  replace(     /,/g, " .. ")
                .  replace(/[\{\}]/g, " $& ")
                , css);

if(Object.keys(user_feedback).length < 1)
    console.dir( feedback_replies_array );
}
/*}}}*/
    return user_feedback;
};
/*}}}*/
/*_ get_user_feedback_from_el_attributes {{{*/
let get_user_feedback_from_el_attributes = function(e_target)
{
//{{{
let log_this=false;

if(log_this) console.log("get_user_feedback_from_el_attributes");
//}}}
    // ┌──────────────────────────────────────────────────────────┐
    // │ subject  sid  qid  question  qcm_rank  comment  feedback │
    // └──────────────────────────────────────────────────────────┘
    let data_topic          = unescape(e_target.getAttribute("data-topic"));
    let {subject, question} = JSON.parse( data_topic );
    let       user_feedback = get_user_feedback(subject, question, "form_div_onclick");

//{{{
if(log_this) console.log("get_user_feedback_from_el_attributes: ➔ data_topic=["+data_topic+"]");
if(log_this) console.dir(user_feedback);
//}}}
    return user_feedback;
};
/*}}}*/

  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ SHOW HIDE                                                           │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*➔ form_div_onclick .. (user feedback html page .. onclick) {{{*/
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
    /* SHOW [form_div] {{{*/

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
    /* form_div INPUT {{{*/
    if(_is_el_child_of_id(e_target, "form_div"))
    {
        // SYNC FORM [hidden] INPUT
        /* QCM or feedback ➔ copy to FORM input value {{{*/
        if( e_target.tagName == "INPUT")
        {
            /* save checkekd qcm radio into qcm_rank_input SUBMIT param*/
            qcm_rank_input.value
                = get_form_div_qcm_rank();

            feedback_input.value
                =    good_input.checked  ? FEEDBACK_GOOD
                : correct_input.checked  ? FEEDBACK_CORRECT
                :   wrong_input.checked  ? FEEDBACK_WRONG
                :     bad_input.checked  ? FEEDBACK_BAD
                :                          undefined;

if(TAG_TREE) console.log("%c ➔ [QCM RANK "+qcm_rank_input.value+"] .. [feedback "+(feedback_input.value || "")+"]", "color:cyan;");

            form_div_sync( event ); // QCM has been answered .. enable purge or submit
        }
        /*}}}*/
        return;
    }
    /*}}}*/
    /* HIDE .. (by removing from parentElement) {{{*/
    let hiding
        =  (!e_target.classList.contains( QUESTION ))
        || (form_div.parentElement == e_target);
//{{{
if(log_this) console.log("hiding=["+hiding+"]");
//}}}
    if( hiding )
    {
        if( form_div.parentElement )
            form_div.parentElement.removeChild( form_div );

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
        /* LOAD PARAMS AND INSERT FORM INTO DOM {{{*/
        let user_feedback = get_user_feedback_from_el_attributes(event.target);
if(log_this) console.log("user_feedback:");
if(log_this) console.dir( user_feedback  );

        form_div_onclick_LOAD( user_feedback );

        e_target.appendChild(form_div, e_target.lastElement);
        /*}}}*/
        // SYNC WITH (possibly changed) [lang] {{{*/
        // .. that may have changed (while hiding i.e. when this form was removed from the DOM)
        // search and sync its children elements
        // once appended back into the DOM (where document can search for them)
        if(typeof i18n_translate != "undefined")
        {
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
        }
        /*}}}*/
    }
    /*}}}*/
};
/*}}}*/
/*_ form_div_onclick_LOAD {{{*/
let form_div_onclick_LOAD = function(user_feedback) /* eslint-disable-line no-unused-vars */ /* eslint-disable-line complexity */
{
/*{{{*/
let log_this=false;

    let { comment
        , feedback
        , qcm
        , qcm_rank
        , qid
        , question
        , subject
    } = user_feedback;

if(log_this) console.log("%c form_div_onclick_LOAD: ["+subject+"] .. ["+question+"])", "border: 3px solid green;");
if(log_this) console.dir(user_feedback);
/*}}}*/
    /* REOPENING SAME ENTRY {{{*/
    if(    (subject_input .value == subject )
        && (question_input.value == question)
      ) {
if(TAG_TREE) console.log("..REOPENING ["+ question_input.value +"] QUESTION");

        return;
    }
    /*}}}*/
    /* RESET ALL FORM-INPUT  {{{*/
    form_div_onclick_LOAD_RESET();

    if(!subject || !question) return;

    /*}}}*/
    /* LOAD FORM-INPUT ➔ [subject question question_id comment] {{{*/

    /**/     subject_input.value =                  subject  ? subject  : "";
    /**/    question_input.value =                  question ? question : "";
    /**/ question_id_input.value = !isNaN( parseInt(qid   )) ? qid      : "";
    /**/     comment_input.value =                 (comment || "");


if(TAG_TREE) console.log("....OPENING ["+ question_input.value +"] QUESTION");
    /*}}}*/
    /* [qcm_rank_input] .. POPULATE OR HIDE {{{*/
    let have_qcm = (qcm && (qcm.length > 0));
    if( have_qcm )
    {
        let innerHTML   = "";
        for(let i=0;  i < qcm.length; ++i)
        {
            let id      = "qcm"+i;
            let label   = qcm[i];

            let checked = (    !isNaN( parseInt(qcm_rank) )
                           &&  (  i ==          qcm_rank  ))
                           ? "checked" : "" ;

            let className
                =         I18N
                +         ((label.startsWith("*")) ? " sanitized" : "");

            innerHTML  += `
  <input  id="${id}" type="radio" name="qcm" value="${label}" ${checked}/>`
+`<label for="${id}" class="${className}">${label}</label>`;
        }
        qcm_panel.innerHTML     = innerHTML;
        qcm_panel.style.display = "block";
        qcm_rank_input.value    = qcm_rank;
    }
    else {
        qcm_panel.style.display      = "none";

        qcm_panel.innerHTML          = ""; /* clear any current input */
    }
    /*}}}*/
    /* [feedback_input] .. HIDE OR POPULATE {{{*/
    if( have_qcm )
    {
        feedback_panel.style.display = "none";
    }
    else {
        feedback_panel.style.display = "block";

        /**/     good_input.checked = feedback ? (feedback == FEEDBACK_GOOD   ) : false;
        /**/  correct_input.checked = feedback ? (feedback == FEEDBACK_CORRECT) : false;
        /**/    wrong_input.checked = feedback ? (feedback == FEEDBACK_WRONG  ) : false;
        /**/      bad_input.checked = feedback ? (feedback == FEEDBACK_BAD    ) : false;
    }
    /*}}}*/
    /* [comment_input] .. COLORIZE EARLIER LOADED FEEDBACK-LEVEL {{{*/ // TODO: cope with qcm_rank
    comment_input  .value
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
    /* [status_panel] {{{*/
    if( status_panel )
    {
        status_panel.style.display  = "block";

        let innerHTML = "";

        if( user_feedback )
        {

if(log_this) console.log("KEYS:" );
if(log_this) console.log( Object.keys  ( user_feedback ) );

if(log_this) console.log("VALUES:" );
if(log_this) console.log( Object.values( user_feedback ) );

            Object.keys(user_feedback) .forEach((k) =>   { innerHTML += "<li>"    +k+"=["+String(user_feedback[k]).replace(/\n/g,"<br>XXX")+"]</li>\n"     ; });

            if(innerHTML.length) innerHTML = "<ul>\n"+innerHTML+"</ul>";
        }
        else {
            innerHTML =
                "No user_feedback for:"
                +"  SUBJECT ["+subject+"]"
                +" QUESTION ["+question+"]";

        }

        if( innerHTML.length)
            innerHTML += "<br>➔ <small><i>STATUS_PANEL IS ONLY DISPLAYED IN A PAGE WITH A <sup>_dev</sup> URL</i></small>";

        status_panel.innerHTML = innerHTML;
    }
    /*}}}*/
};
/*}}}*/
/*_ form_div_onclick_LOAD_RESET {{{*/
let form_div_onclick_LOAD_RESET = function()
{
    submit       .classList.add   ("disabled"   );  submit.disabled = true;
    purge        .classList.add   ("disabled"   );  purge .disabled = true;

    /**/    good_input.checked   =  false;
    /**/ correct_input.checked   =  false;
    /**/   wrong_input.checked   =  false;
    /**/     bad_input.checked   =  false;

    comment_input.classList.remove("mandatory"  );
    comment_input.classList.remove("min_reached");
};
/*}}}*/
/*_ get_form_div {{{*/
let get_form_div = function(user_id,lang)
{
    /* FORM PANELS [form_div qcm feedback qcm] {{{*/
    form_div                = document.getElementById( "form_div"       );
    /**/    feedback_panel  = document.getElementById( FEEDBACK_PANEL   );
    /**/         qcm_panel  = document.getElementById( QCM_PANEL        );
    /**/      status_panel  = document.location.href.includes("dev")
    /**/                    ? document.getElementById( STATUS_PANEL     )
    /**/                    : null;

    form_div.addEventListener("submit", form_div_submit_handler        );
    /*}}}*/
    /* SESSION HIDDEN INPUT [user_id lang] {{{*/
    user_id_input           = document.getElementById( "user_id"        );
    lang_input              = document.getElementById( "lang"           );

    user_id_input.value     = user_id;
    lang_input   .value     = lang   ;

    /*}}}*/
    /* SUBMIT BUTTONS [submit] [purge] {{{*/
    submit                  = document.getElementById( "button_submit"  );
    purge                   = document.getElementById( "button_purge"   );

    /*}}}*/
    /* USER INPUT FIELDS [subject question qcm feedback comment] {{{*/
    /**/      subject_input = document.getElementById( SUBJECT          );
    /**/     question_input = document.getElementById( QUESTION         );
    /**/  question_id_input = document.getElementById( QUESTION_ID      );

    /**/     qcm_rank_input = document.getElementById( QCM_RANK         );

    /**/     feedback_input = document.getElementById( FEEDBACK         );
    /**/         good_input = document.getElementById( FEEDBACK_GOOD    );
    /**/      correct_input = document.getElementById( FEEDBACK_CORRECT );
    /**/        wrong_input = document.getElementById( FEEDBACK_WRONG   );
    /**/          bad_input = document.getElementById( FEEDBACK_BAD     );


    /**/      comment_input = document.getElementById( COMMENT          );
    /*}}}*/
};
/*}}}*/
/*_ get_form_div_qcm_rank {{{*/
let get_form_div_qcm_rank = function()
{
    let qcm_rank;

    let qcm_input_array
        = qcm_panel.querySelectorAll("INPUT");

    for(let i=0; i < qcm_input_array.length; ++i)
    {
        if( qcm_input_array[i].checked )
        {
            qcm_rank = i;

            break;
        }
    }

    return qcm_rank;
};
/*}}}*/
/*  _is_el_child_of_id {{{*/
let _is_el_child_of_id = function(el, id)
{
    while(el && (el.id != id) && (el = el.parentElement)) // eslint-disable-line no-param-reassign
        ;
    return (el != null);
};
/*}}}*/
/*  _get_cookie {{{*/
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

  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ SUBMIT                                                              │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*_ form_div_submit_handler {{{*/
let form_div_submit_handler = function(event) /* eslint-disable-line complexity */
{
/*{{{*/
let log_this=false;

if(log_this) console.log("%c form_div_submit_handler", "border: 1px solid cyan;");
/*}}}*/
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

    /* COLLECT OR CLEAR FORM PARAMS TO SUBMIT {{{*/
    let action
        = event.submitter.formAction.includes("submit")
        ?  "submit"
        :  "purge";

    if(action == "purge")
    {
        qcm_rank_input.value = "-1";
        feedback_input.value = "";
        comment_input .value = "";
    }
    /*}}}*/
    /* FORMAT USER TEXT {{{*/
    comment_input
        .value =     comment_input.value
        .  replace(/’/gm     , "''") // APOS (x2)
        .  replace(/\s\s+$/gm, "\n") // no-multiple-empty-lines
        .  trim();

if(log_this) console.log("%c form_div_submit_handler:\n"
                         + " -      action=["+ action      +"]\n"
                         + " -     subject_input.value=["+     subject_input.value +"]\n"
                         + " -    question_input.value=["+    question_input.value +"]\n"
                         + " - question_id_input.value=["+ question_id_input.value +"]\n"
                         + " -    qcm_rank_input.value=["+    qcm_rank_input.value +"]\n"
                         + " -    feedback_input.value=["+    feedback_input.value +"]\n"
                         + " -     comment_input.value=["+     comment_input.value +"]\n"
                         , "color:cyan;");

    /*}}}*/

    /* SERVER-DATA .. SUBMIT [dialog_form] {{{*/

//  let form = event.srcElement;
    let form = document.forms.dialog_form;
//{{{
//console.log("form:"       )
//console.dir( form         )
//console.log("form.submit:")
//console.dir( form.submit  )
//}}}

    /* RESPONSE GUI TARGET */
    form.target = "response_iframe";
//{{{
//console.log("%c comment=["+comment+"]", "color:orange;")
//console.log("form.target.submit():")
//console.dir( form.target  )
//}}}

if(TAG_TREE) console.log("FORM SUBMIT");
    form.submit();
    /*}}}*/
    /* CLIENT-DATA .. UPDATE LOCALLY .. f(submit) {{{*/
    for(let i=0; i < feedback_replies_array.length; ++i)
    {
        /* reach subject question feedback_reply {{{*/
        let            feedback_reply = feedback_replies_array[i];

        if(subject_input .value != feedback_reply.subject ) continue;
        if(question_input.value != feedback_reply.question) continue;

        /*}}}*/
        /* purge  feedback_reply {{{*/
        if(action == "purge")
        {
//{{{
//console.log("..."+action+": splice("+i+",1) feedback_replies_array.feedback_reply #"+i+"")
//}}}
            feedback_replies_array.splice(i,1);
        }
        /*}}}*/
        /* submit feedback_reply {{{*/
        else {
//{{{
//console.log("..."+action+": updating feedback_replies_array.item #"+i+"")
//}}}
            feedback_reply.feedback = feedback_input.value; // good correct wrong bad
            feedback_reply.qcm_rank = qcm_rank_input.value; // [qcm_rank]
            feedback_reply.comment  =  comment_input.value; // comment
        }
        /*}}}*/
        break;
    }
    /*}}}*/

    /* CLIENT FORM RESET .. f(purge) {{{*/
    if(action == "purge")
    {
//{{{
//console.log("..."+action+": RESETTING form_div")
//}}}

        /* FEEDBACK DATA */
        /**/    good_input.checked = false;
        /**/ correct_input.checked = false;
        /**/   wrong_input.checked = false;
        /**/     bad_input.checked = false;

        /**/ comment_input.value   = "";

        /* FEEDBACK UI */
        submit .classList.add("disabled"); submit.disabled = true;
        purge  .classList.add("disabled"); purge .disabled = true;

        comment_input.style.backgroundColor = "";
    }
    /*}}}*/
    /* HIDE FORM DIV {{{*/
    if(typeof feedback_replies_array != "undefined")
    {
        setTimeout(function() {
            if( form_div.parentElement )
                form_div.parentElement.removeChild( form_div );
        }, (action == "purge") ? 200 : THANK_YOU_ACK_MS);

    }
    /*}}}*/
    /* SYNC [feedback value] {{{*/
    form_div_submit_handler_sync_GUI(action, subject_input.value, question_input.value, qcm_rank_input.value, feedback_input.value);

    /*}}}*/

//{{{
//console.log("feedback_replies_array")
//console.dir( feedback_replies_array )
//}}}
    //document.location.reload();
    /* RELOAD GUI */
//  setTimeout(populate_GUI, 1000);
};
/*}}}*/
/*_ form_div_submit_handler_sync_GUI {{{*/
let form_div_submit_handler_sync_GUI = function(_action, _subject, _question, _qcm_rank, _feedback)
{
//{{{
let log_this=false;

if(log_this) console.log("%c form_div_submit_handler_sync_GUI(_action=["+_action+"] _subject=["+_subject+"]  _question=["+_question+"]  _qcm_rank=["+_qcm_rank+"]  _feedback=["+_feedback+"]", "background-color:navy;");
//}}}

    let feedback = (_action == "purge") ? "" : _feedback;
    let qcm_rank = (_action == "purge") ? "" : _qcm_rank;
//console.log("feedback=["+feedback+"]")
//console.log("qcm_rank=["+qcm_rank+"]")

    let el_array = Array.from( document.querySelectorAll(".question") );
//{{{
//console.log("el_array querySelectorAll(form_div .question):")
//console.dir( el_array )
//}}}

    _subject  = _subject .replace(regexp_NOWRD, " ");
    _question = _question.replace(regexp_NOWRD, " ");

    for(let i = 0; i < el_array.length; ++i)
    {
        /* ACCESS EACH question.GUI {{{*/
        let el = el_array[i];
//{{{
//console.log("el")
//console.dir( el )
//}}}

        /*}}}*/
        /* FIND MATCHING {subject , question} from el dataSet attribute {{{*/
        let data_topic          = unescape(el.getAttribute("data-topic"));
        let {subject, question} = JSON.parse( data_topic );
//{{{
if(log_this) console.log("form_div_submit_handler_sync_GUI: ➔ data_topic=["+data_topic+"]");
if(log_this) console.log("subject=["+subject+"] .. question=["+question+"]");
//}}}
        if(_subject  != subject .replace(regexp_NOWRD, " ")) continue;
        if(_question != question.replace(regexp_NOWRD, " ")) continue;

        /*}}}*/
        /* SYNC  question.GUI CSS .. f(qcm_rank LEVEL) .. f(feedback LEVEL) {{{*/
        let className = get_qcm_className(qcm_rank, feedback, el.untransltated_textContent);
        el .className = className;

if(TAG_TREE) console.log("["+className+"] ➔ "+el.untransltated_textContent);
        /*}}}*/
    }
};
/*}}}*/

  // ┌─────────────────────────────────────────────────────────────────────┐ -->
  // │ EVENT                                                               │ -->
  // └─────────────────────────────────────────────────────────────────────┘ -->
/*➔ comment_monitor {{{*/
/*{{{*/
const LF = String.fromCharCode(10); /* eslint-disable-line no-unused-vars */

let ta_status;
/*}}}*/
let comment_monitor = function(event)
{
//{{{
let log_this=false;

if(log_this) console.clear();
if(log_this) console.log("comment_monitor("+(event ? event.type : "")+")");
//}}}

    if(!comment_input) return;

    // ENTER ➔ SUBMIT FORM (see I18N/i18n_populate.js)
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
    if( event )
    {
        /* validation params {{{*/
        let warn_length =  comment_input.maxLength - 32;
        let min_reached = (comment_input.value.length >= comment_input.minLength);
        let max_reached = (comment_input.value.length >= comment_input.maxLength);
        let red_reached = (comment_input.value.length >= warn_length            );

        let count_down  = (comment_input.minLength+" < "+comment_input.value.length +" < "+comment_input.maxLength);

        let available
            = (red_reached && !max_reached)
            ?  "oooooooooooooooooooooooooooooooo".substring(0,comment_input.maxLength - comment_input.value.length)
            :  "";

        /*}}}*/
        /* validation status {{{*/
        ta_status.innerText
            = count_down +" "+ available;

if(log_this) {
    console.log("...minLength= ["+ comment_input.minLength +"]");
    console.log("...maxLength= ["+ comment_input.maxLength +"]");
    console.log("warn_length = ["+ warn_length             +"]");
    console.log("min_reached = ["+ min_reached             +"]");
    console.log("red_reached = ["+ red_reached             +"]");
    console.log(".count_down = ["+ count_down              +"]");
    console.log("..available = ["+ available               +"]");
    console.log( ta_status.innerText );
}

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
if(log_this) console.log("NOT A USER-EVENT ➔ RESETTING COMMENT");

//      comment_input.value = "";
        comment_input.classList.remove("mandatory"  );
        comment_input.classList.remove("min_reached");

        if(ta_status) ta_status.innerText = "";
    }
    /*}}}*/
    form_div_sync(); // f(need_comment min_reached) .. enable purge or submit
};
/*}}}*/
/*➔ form_div_sync .. (disable submit purge) .. (comment mandatory min_reached) {{{*/
let form_div_sync = function(/*event*/) /* eslint-disable-line complexity */
{
//{{{
let log_this=false;

if(log_this) console.log("form_div_sync");
//}}}

    if(!submit) return; // TOO EARLY

    // RESET FORM and return .. (!event) .. @see ../CLIENT/feedback_tree.js
    /* [need_comment] {{{*/
    let need_comment = (wrong_input.checked || bad_input.checked);

    if( need_comment )  comment_input.minLength =  24;
    else                comment_input.minLength =   0;
    /*}}}*/
    /* BLINK GUI .. f((some_checked required) {{{*/
    let qcm_rank_checked
        = (get_form_div_qcm_rank() != undefined);

    let some_checked
        =   wrong_input.checked ? "wrong"
        :     bad_input.checked ? "bad"
        :    good_input.checked ? "good"
        : correct_input.checked ? "correct"
        :      qcm_rank_checked ? "qcm_rank"
        :                         ""
    ;

if(log_this) console.log("...need_comment=["+need_comment+"]");
if(log_this) console.log("...some_checked=["+some_checked+"]");

    if(!some_checked) {
        /**/    good_input.classList.add("blink"); setTimeout(() => {    good_input.classList.remove("blink"); }, 300);
        /**/ correct_input.classList.add("blink"); setTimeout(() => { correct_input.classList.remove("blink"); }, 400);
        /**/   wrong_input.classList.add("blink"); setTimeout(() => {   wrong_input.classList.remove("blink"); }, 500);
        /**/     bad_input.classList.add("blink"); setTimeout(() => {     bad_input.classList.remove("blink"); }, 600);
    }
    /*}}}*/
    /* [min_reached] .. [can_submit] {{{*/
    let min_reached  = (comment_input.value.length >= comment_input.minLength);

    let can_submit   =  some_checked && (!need_comment || min_reached);
    let can_purge    =  some_checked                                  ;

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

    return { populate_GUI  // (called onload)
        ,    form_div_onclick
        ,    comment_monitor
        ,    form_div_sync
        // DEBUG ONLY
        ,  populate_get_feedback_items_array
        ,  get_form_div_qcm_rank
    };
})();

setTimeout( feedback_tree.populate_GUI, 500); /* onload */

