//┌────────────────────────────────────────────────────────────────────────────┐
//│ [i18n_translate] .. [set_lang] [get_lang] [get_i18n]                       │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  module, i18n_translate_json */
/* globals  console, document, navigator, XMLHttpRequest */
/* exported set_lang */
/* eslint-disable no-warning-comments */

const I18N_TRANSLATE_JS_ID  = "i18n_translate";
const I18N_TRANSLATE_JS_TAG = I18N_TRANSLATE_JS_ID+" (211014:14h:20)";    // eslint-disable-line no-unused-vars
/*}}}*/
//try { i18n_translate_json = require("./i18n_translate_json.js"); } catch(ex) {} // server-side-only requirement
let i18n_translate = (function() {
"use strict";
const LOG_I18N = false;
const TAG_I18N = false;

//┌────────────────────────────────────────────────────────────────────────────┐
//│ SET ➔ GET ➔ NEW                                                            │
//└────────────────────────────────────────────────────────────────────────────┘
/*{{{*/
const LANG_KEY = "lang";

/*}}}*/
/*➔ set_lang {{{*/
/*{{{*/
let     lang_current;

/*}}}*/
let set_lang = function(_lang,_caller)
{
let log_this = LOG_I18N;
if( log_this || TAG_I18N) console.log("%c set_lang(["+_lang+"] ["+_caller+"])", "border:3px solid orange; font-size:150%;");
    /* SET CURRENT LANG {{{*/
    if(!_lang) return lang_current;
    let  lang    = _lang.toUpperCase().trim();
    if(( lang  == "US") || (lang == "GB"))
         lang   = "EN";
    lang_current = lang;

    if(    !lang_errors[lang_current] )
        ini_lang_errors(lang_current);

    /*}}}*/
    /* ➔ no document to update when called from server-side {{{*/
    let server_side = (typeof document == "undefined");
    if( server_side ) return lang_current;

    /*}}}*/
    /* SET HTML LANG {{{*/
    let html  = document.getElementsByTagName("HTML")[0];
    html.lang = lang;

    /*}}}*/
    /* CHECK LANG RADIO-BUTTON {{{*/
    let el = document.getElementById(lang);
if( log_this) console.log("➔ LANG RADIO-BUTTON [lang]:");
if( log_this) console.dir(el);
    if( el ) el.checked = true;

    /* FORM [lang] PARAMETER */
    el = document.getElementById("lang"); /* form input to persist current lang */
if( log_this) console.log("➔ FORM [lang] PARAMETER:");
if( log_this) console.dir(el);
    if( el ) el.value = lang;

    /* QUERY [country_select] */
    el = document.getElementById("country_select");
if( log_this) console.log("➔ QUERY [country_select]:");
if( log_this) console.dir(el);
    if( el ) el.value = lang;

    /*}}}*/
    /* UPDATE COOKIE {{{*/
if( log_this) console.log("➔ UPDATE COOKIE: lang=["+lang+"]");

    set_cookie("lang", lang);
if( log_this || TAG_I18N) console.log("%c"+document.cookie, "border: 3px solid green; font-size:120%;");

    /*}}}*/
    /* UPDATE GUI TRANSLATION {{{*/
    sync_i18n_elements();

    /*}}}*/
    return lang_current;
};
/*}}}*/
/*_ set_cookie {{{*/
let set_cookie = function(name,value)
{
//console.log("set_cookie("+name+" , "+value+")")

    document.cookie = name+"="+String(value).trim()+"; max-age="+(24*3600)+"; path=/";
};
/*}}}*/
/*➔ get_lang {{{*/
let get_lang = function()
{
    /* RETURN [lang_current] .. (if set) {{{*/
// console.log("%c get_lang", "font-size:200%")

    if(lang_current) return lang_current;
    /*}}}*/
    /* FROM LANG_KEY COOKIE {{{*/
    lang_current = _get_cookie(LANG_KEY);
    if( lang_current )
    {
        set_lang(lang_current, "FALLBACK TO NAVIGATOR LANG");
    }
    /*}}}*/
    /* FALLBACK TO NAVIGATOR LANG {{{*/
    else if( navigator )
    {
        lang_current = navigator.language.substring(0,2).toUpperCase();

        set_lang(lang_current, "FALLBACK TO NAVIGATOR LANG");
    }
    /*}}}*/
    return lang_current;
};
/*}}}*/
/*➔ new_lang {{{*/
let new_lang = function(_lang,_caller)
{
let log_this = LOG_I18N;
if( log_this || TAG_I18N) console.log("%c new_lang(["+_lang+"] ["+_caller+"])", "border:3px solid orange; font-size:150%;");
    /* BY [onclick] OR [SELECT onchange] {{{*/

    // HTML event:
    // i18n_translate.new_lang(event.target.id    , "BY CLICK" );
    // i18n_translate.new_lang(event.target.value , "BY SELECT");

    /*}}}*/
    /* SET [lang_current] .. f(_lang) {{{*/
    if(!_lang) return;
    let  lang    = _lang.toUpperCase().trim();
    if(( lang  == "US") || (lang == "GB"))
         lang   = "EN";

    lang = set_lang(lang, _caller);
    /*}}}*/
//  /* ➔ RELOAD .. f(href parameter) {{ {*/
//  // https://192.168.1.14:444/CLIENT/user_feedback_dev.html?lang=EN&user_id=5073869e-097a-4b94-a7c5-9694f3a5397d
//  let href     = document.location.href.replace(/lang=../, "lang="+lang+"");

//  console.log("NAVIGATE TO href=["+href+"]");
//  document.location.href = href;
//  /*}}}*/
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ TRANSLATE                                                                  │
//└────────────────────────────────────────────────────────────────────────────┘
/*➔ get_i18n {{{*/
/*{{{*/
const FEEDBACK_I18N_JSON     = "i18n_translate_json";
const LANG_NOT_SUPPORTED_YET = "LANG NOT SUPPORTED YET";

/*}}}*/
let get_i18n = function(_index_phrase, _lang=lang_current) /* eslint-disable-line complexity */
{
//console.log("%c get_i18n", "font-size:200%")
let log_this = LOG_I18N;
    /* [lang key] trim {{{*/
    let index_phrase
        = _index_phrase.trim()
        . replace(/^\d+\s*[\.-]?\s*/,"") // TRIM ORDERING-HEADER: (digit > space > punct > space) > phrase
        ;
if( log_this) console.log("index_phrase=["+index_phrase+"]");

    let         lang = (_lang) ? _lang : get_lang();
    /*}}}*/
    /* [i18n_translate_json] undefined {{{*/
    if(typeof i18n_translate_json == "undefined")
    {
        /* REPORT FEEDBACK_I18N_JSON {{{*/
        let msg = "["+lang+"] ["+FEEDBACK_I18N_JSON+"] IS NOT DEFINED";
            add_lang_errors(lang, msg);

        /*}}}*/
        return index_phrase;
    }
if( log_this) console.log("i18n_translate_json:");
if( log_this) console.log( i18n_translate_json  );
    /*}}}*/
    /* [lang] not supported yet {{{*/
    if(!i18n_translate_json[lang])
    {
        let msg = "["+lang+"] "+ LANG_NOT_SUPPORTED_YET;
            add_lang_errors(lang, msg);

        // ...fall through .. so that missing terms will be reported
    }
    /*}}}*/
    /* [lang] OK BUT NO TRANSLATION FOR [index_phrase] {{{*/
if( log_this) console.log("i18n_translate_json[lang]:");
if( log_this) console.log( i18n_translate_json[lang]  );
if( log_this) console.log("index_phrase=["+index_phrase+"]");

    let translated
        =     i18n_translate_json[lang]
        ? (   i18n_translate_json[lang][index_phrase              ]
           || i18n_translate_json[lang][index_phrase.toLowerCase()]) // relaxed
        : "";

    if(!translated && !i18n_translate_json[index_phrase]) // skip lang-buttons
    {
        let msg = "["+lang+"] NO TRANSLATION FOR ["+index_phrase+"]";
            add_lang_errors(lang, msg);

    }
    /*}}}*/

if( log_this) console.log("translated=["+translated+"] .. index_phrase=["+index_phrase+"]");
//if(!translated) console.trace()
    return translated || index_phrase;
};
/*}}}*/
/*➔ sync_i18n_elements {{{*/
let sync_i18n_elements = function(_el_array)
{
let log_this = LOG_I18N;
if( log_this) console.log("%c sync_i18n_elements("+(_el_array ? _el_array.length:"")+"): lang_current=["+lang_current+"]", "background-color:#4E4; color:black;");
if( log_this) console.dir(_el_array);

    /* process [passed elements] OR [collect likely translation targets] */
    let el_array
        = _el_array
        ? _el_array
        : Array.from( document.querySelectorAll(".i18n") );
//console.trace()
//console.dir(el_array)

if( log_this) console.log("el_array.length=["+el_array.length+"]");
if( log_this) console.dir( el_array );

    for(let i = 0; i < el_array.length; ++i)
    {
        let      el = el_array[i];

        let      el_is_a_number = !isNaN( parseInt(el.innerText) );
        if     ( el_is_a_number ) continue;
        else if( el.innerText   ) el_set_lang(el, lang_current);
        else if( el.placeholder ) el_set_lang(el, lang_current);
    }

    send_lang_errors();
};
/*}}}*/
/*… el_set_lang {{{*/
let el_set_lang = function(el,lang)
{
let log_this = LOG_I18N;
if( log_this) console.log("el_set_lang("+(el.id || el.tagName)+" , "+lang+")");

    if(el.placeholder)
    {
        if(!el.placeholder_origin)
            el.placeholder_origin = el.placeholder;
        el.placeholder = get_i18n(el.placeholder_origin, lang);
    }
    else {
/* if(data_topic) {{{*/
        let data_topic =      el.getAttribute("data-topic") ;
        if( data_topic )
        {
            data_topic = unescape(data_topic);
if( log_this) console.log("data_topic=["+data_topic+"]");

            let { subject , question } = JSON.parse( data_topic );

            el.untransltated_textContent = question || subject;
if( log_this) console.log(el.untransltated_textContent);
        }
/*}}}*/

        if(!el.untransltated_textContent)
            el.untransltated_textContent =          el.firstChild   .textContent;
        el. firstChild.textContent       = get_i18n(el.untransltated_textContent, lang);

if(log_this) console.log("el_set_lang("+(el.id || el.tagName)+" , "+lang+") %c["+el. untransltated_textContent +"]", "background-color:#888");
if(log_this) console.log("el_set_lang("+(el.id || el.tagName)+" , "+lang+") %c["+el. firstChild.textContent    +"]", "background-color:#000");
    }
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ MISSING TRANSLATIONS                                                       │
//└────────────────────────────────────────────────────────────────────────────┘
/*_ add_lang_errors {{{*/
/*{{{*/
let lang_errors        = {};

/*}}}*/
let add_lang_errors = function(lang,new_msg)
{
//console.log("%c add_lang_errors("+lang+" , "+new_msg+")", "font-size:200%")
    if( lang_errors[lang] && lang_errors[lang].msg.includes( new_msg ))
        return;

//if(TAG_I18N) console.log("%c "+new_msg+"", "color:orange;");

    if(!lang_errors[lang_current])
        ini_lang_errors(lang_current);

    lang_errors[lang_current].count += 1;

    let msg = (     ( lang_errors[lang_current].count < 10) /* count with 2-digit-wide-format */
               ? " "+ lang_errors[lang_current].count
               :      lang_errors[lang_current].count
              ) +" "+ new_msg
    ;
    lang_errors[lang_current].msg
        += (lang_errors[lang_current].msg ? "\n" : "")
        +    msg;

/* if some already reported .. add this one to the console .. or just wait for next bunch report call */
//if(lang_errors[lang_current].reported) console.log( msg )
};
/*}}}*/
/*_ ini_lang_errors {{{*/
let ini_lang_errors = function(lang)
{
//console.log("%c ini_lang_errors", "font-size:200%")
let log_this = LOG_I18N;
if( log_this) console.log("%c ini_lang_errors("+lang+")", "color:orange;");

    lang_errors[lang]
        = {        msg : "" /* clear [to-be-appended-to properties] */
            ,    count : 0  /* line count of added msg so far */
            , reported : 0  /* sent to server */
        };
};
/*}}}*/
/*_ send_lang_errors {{{*/
let send_lang_errors = function(verbose=false) /* eslint-disable-line no-unused-vars */
{
/* LOG TO DEVTOOLS CONSOLE {{{*/
let log_this = LOG_I18N;
if( log_this) console.log("lang_errors:");
if( log_this) console.log( lang_errors  );

if(verbose || log_this || TAG_I18N) {
    let msg = "┌─ send_lang_errors ───────────────────────────────────────────────────────────┐\n"
        +     "│    count=["+lang_errors[lang_current].count    +"]\n"
        +     "│ reported=["+lang_errors[lang_current].reported +"]\n"
        +     "├──────────────────────────────────────────────────────────────────────────────┤\n"
        +        lang_errors[lang_current].msg                   +"\n"
        +     "└──────────────────────────────────────────────────────────────────────────────┘"
    ;
    let color = (lang_errors[lang_current].reported < lang_errors[lang_current].count)
        ? "background-color: #800;"
        : "background-color: #040;"
    ;
    console.log("%c"+msg, color);
}
/*}}}*/
    /* nothing to report */
    if( !lang_errors[lang_current] ) return;

    let all_logged
        = (   lang_errors[lang_current].count
           == lang_errors[lang_current].reported);

    if(!all_logged)
    {
        /* TRACK REPORTED TO SERVER COUNT */
        lang_errors      [lang_current].reported
            = lang_errors[lang_current].count;

        /* REPORT TO BACK-END-SERVER */
        rep_lang_errors(verbose);
    }
    else {
if(verbose || log_this || TAG_I18N) console.log("➔ %c ALL ("+lang_errors[lang_current].count+") [lang_errors] HAVE BEEN REPORTED TO SERVER", "border: 3px solid green;");
    }
};
/*}}}*/
/*_ rep_lang_errors {{{*/
let rep_lang_errors = function(verbose)
{
let log_this = LOG_I18N;
if( log_this) console.log("%c rep_lang_errors:", "background-color: #800;");
/*{{{*/
//console.log("lang_errors:");
//console.dir( lang_errors  );
//console.dir("lang_errors:");
//console.dir( lang_errors  );

//console.dir("document.location:");
//console.dir( document.location  );
/*}}}*/

    /* COLLECT MISSING TERMS {{{*/
    let lang_errors_list = [];
    for(let k=0; k < Object.keys(lang_errors).length; ++k)
    {
        let      lang = Object.keys(lang_errors)[k];
        let    errors = lang_errors[lang];

        let msg_lines = errors.msg.split("\n");
        let     count = msg_lines.length;
        if(errors.msg.endsWith("\n"))  count -= 1; // drop empty trailing line

        if(count > 1)
            for(let i=0; i< count; ++i)
                lang_errors_list.push(  msg_lines[i] );
        else
            lang_errors_list.push(  errors.msg   );

    }
if( log_this) console.log("...lang_errors_list.length=["+lang_errors_list.length+"]");
    /*}}}*/
    /* CLEANUP CONSOLE-LOG FORMATTING .. return an array of { lang : miss } {{{*/
if(verbose || log_this || TAG_I18N) console.log("➔ %c REPORTING "+lang_errors_list.length+" [lang_errors] TO SERVER:", "border: 3px solid red;");

    for(let k=0; k < lang_errors_list.length; ++k)
    {
        let line =    lang_errors_list[k].match(/^\s*\d*\s*(.*)$/)[1];
if( log_this) console.log((k+1)+"%c line=["+line+"]", "color:#D00;");
        //..............................___NNN____[.........]...............vv
        let lang_matches     = line.match(/^\s*\d*\s*\[([^\]]+)\]/ ); // first [.*]
        if( lang_matches ) {                       // [.........]$
            let miss_matches = line.match(          /\[([^\]]+)\]$/); // last  [.*]
            lang_errors_list[k]
                =  {  lang : lang_matches ? lang_matches[1] : null
                    , miss : miss_matches ? miss_matches[1] : "LANG NOT YET SUPPORTED"
                };
        }
/* log not reported errors */
        else {
            console.warn(line);
        }
    }

if( log_this) console.log("%c lang_errors_list:", "background-color:#800; color:yellow;");
if( log_this) console.dir( lang_errors_list  );
    /*}}}*/

    if(lang_errors_list.length)
    {
        let xhr = new XMLHttpRequest();
        let url = document.location.hostname+"/lang_errors";
        xhr.open            ("POST"        , url, true); // async
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send            ("lang_errors="+ JSON.stringify(lang_errors_list));
    }
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ COOKIES                                                                    │
//└────────────────────────────────────────────────────────────────────────────┘
/*_ _get_cookie {{{*/
let _get_cookie = function(key)
{
    let    value;
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
//console.log("_get_cookie("+key+") ...return ["+value+"]")
    return value;
};
/*}}}*/

return { set_lang
    ,    get_lang
    ,    get_i18n
    ,    new_lang
    ,    sync_i18n_elements
    // DEBUG
    , send_lang_errors : () => send_lang_errors(true) // verbose
};
})();

try { module.exports = i18n_translate; } catch(ex) {} /* server.js require */

