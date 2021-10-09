//┌──▼▼▼▼▼▼────────────────────────────────────────────────────────────────────┐
//│ [SERVER]                                                                   │
//└──▲▲▲▲▲▲────────────────────────────────────────────────────────────────────┘
/* jshint esversion: 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  require, process */
/* globals  console */
/* eslint-disable no-warning-comments */

const SERVER_JS_ID  = "server";
const SERVER_JS_TAG = SERVER_JS_ID    +" (211008:18h:25)";
/*}}}*/
let server = (function() {
"use strict";

//┌────────────────────────────────────────────────────────────────────────────┐
//│ DEPENDENCIES                                                               │
//└────────────────────────────────────────────────────────────────────────────┘
//➔ CONST {{{*/
const DEFAULT_URI_PATH              = "./index.html";
const TRACE_OPEN  = " {{{";
const TRACE_CLOSE = " }}}";

const THANKS_FOR_YOUR_FEEDBACK      = "Thank you for your feedback";
/*}}}*/
//➔ ANSII-TERMINAL {{{*/
const    LF = String.fromCharCode(10);
const   ESC = String.fromCharCode(27);
const R=ESC+"[1;31m"; //     RED
const G=ESC+"[1;32m"; //   GREEN
const Y=ESC+"[1;33m"; //  YELLOW
const B=ESC+"[1;34m"; //    BLUE
const M=ESC+"[1;35m"; // MAGENTA
const C=ESC+"[1;36m"; //    CYAN
const N=ESC+"[0m"   ; //      NC

let log_X = function(args         ) { console.log(      ...args ); };
let log_R = function(arg0, ...rest) { log_X([ R + arg0, ...rest]); };
let log_G = function(arg0, ...rest) { log_X([ G + arg0, ...rest]); };
let log_B = function(arg0, ...rest) { log_X([ B + arg0, ...rest]); };

let log_C = function(arg0, ...rest) { log_X([ C + arg0, ...rest]); };
let log_M = function(arg0, ...rest) { log_X([ M + arg0, ...rest]); };
let log_Y = function(arg0, ...rest) { log_X([ Y + arg0, ...rest]); }; // eslint-disable-line no-unused-vars

let log_N = function(arg0, ...rest) { log_X([ N + arg0, ...rest]); };

/*}}}*/
//➔ REQUIRE {{{*/
//➔ [fs http https networkInterfaces] {{{
let   fs                        = require("fs"   );
let   http                      = require("http" );
let   https                     = require("https");
let { networkInterfaces }       = require("os"   );
//}}}
//➔ [config defaults] {{{
let   config              =
{     LOAD_STATUS               : ""

    , PORT_HTTP                 :  81
    , PORT_HTTPS                : 444
//  ,  KEY_PEM                  : "../../KEYSTORE/server/privkey.pem"
//  , CERT_PEM                  : "../../KEYSTORE/server/fullchain.pem"

//  , HOST                      : "localhost"
//  , USER                      : "postgres"
//  , PASSWORD                  : "ivan"
//  , DATABASE                  : "cxu-feedback"
//  , FEEDBACK_TABLE            : "feedbacks"
//  , URI_DIR                   :    "Files"
//  , URI_DIR_TARGET            : "C:/Files"

};

/*_ config_LOAD_STATUS_log {{{*/
let config_LOAD_STATUS_log = function(msg)
{
    if( config.LOAD_STATUS )
        config.LOAD_STATUS +=  LF;
    else
        config.LOAD_STATUS  =  "";
    config.LOAD_STATUS     += msg;
};
/*}}}*/
/*}}}*/
//➔ CONFIG_JSON {{{
const CONFIG_JSON               = "./config.json" ;
const CONFIG_DEV_JSON           = "./config_dev.json" ;
let   config_json               = fs.existsSync( CONFIG_DEV_JSON ) ? CONFIG_DEV_JSON : CONFIG_JSON;

try {
    config                      = require(      config_json );
    config_LOAD_STATUS_log(       `CONFIG    [${config_json}]`);
} catch(ex) {
    let cwd = process.cwd().replace(/\\/g,"/");
    config_LOAD_STATUS_log(       "****************************************"         + LF
                                + "*** ERROR WHILE LOADING FILE ["+ config_json  +"]"+ LF
                                + "*** IN FOLDER ["+                cwd          +"]"+ LF
                                + "*** "+ ex.message.replace(/\n/g,"\n*** ")         + LF
                                + "****************************************"             );
}
/*}}}*/
//➔ SQL_REQUIRE {{{
const SQL_REQUIRE               = "./POSTGRES/server_sql.js";
let   server_sql;
try {
    server_sql                  = require(      SQL_REQUIRE );
    config_LOAD_STATUS_log(       `CONFIG    [${SQL_REQUIRE}]`);
} catch(ex) {
    config_LOAD_STATUS_log(       `******    [${SQL_REQUIRE}] ERROR ➔ ${ex}`);
}

/*}}}*/
//➔ POSTGRES_REQUIRE {{{
const POSTGRES_REQUIRE          = "./CONTROL/feedback_postgres.js";
let   feedback_postgres;
try {
    feedback_postgres           = require(      POSTGRES_REQUIRE );
    config_LOAD_STATUS_log(       `CONFIG    [${POSTGRES_REQUIRE}]`);
} catch(ex) {
    config_LOAD_STATUS_log(       `******    [${POSTGRES_REQUIRE}] ERROR ➔ ${ex}`);
}

/*}}}*/
//➔ DOWNLOAD_REQUIRE {{{
const DOWNLOAD_REQUIRE          = "./CONTROL/server_download.js";
let   server_download;
try {
    server_download             = require(      DOWNLOAD_REQUIRE );
    config_LOAD_STATUS_log(       `CONFIG    [${DOWNLOAD_REQUIRE}]`);
} catch(ex) {
    config_LOAD_STATUS_log(       `******    [${DOWNLOAD_REQUIRE}] ERROR ➔ ${ex}`);
}

/*}}}*/
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ STATUS                                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*_ log_STATUS {{{*/
let log_STATUS = function(response) // eslint-disable-line complexity
{
    /* CLEAR TERMINAL {{{*/
//  log_CLEAR();

    /*}}}*/
    /* CONFIG {{{*/
    /* COLORS {{{*/
    let s;
    let log_color  = config.LOAD_STATUS.includes("ERROR") ? R : M;
/*  response CSS {{{*/
if( response )
    response.write(
`<style>
.info  { background-color: #222; color: #0F3; }
.error { background-color: #222; color: #F03; }
</style>`
                  );

/*}}}*/
    /*}}}*/
    /* [config items] {{{*/
    s  = "┌───────────────────────────────────────────────────────────────────── CONFIG ─┐";

    s +=`
│ ${SERVER_JS_TAG}
├
│ CONFIG            [${config_json        }]
│ CWD               [${process.cwd()      }]
├
│ PORT_HTTP         [${config.PORT_HTTP   }]
│ PORT_HTTPS        [${config.PORT_HTTPS  }]
│  KEY_PEM          [${config. KEY_PEM    }]
│ CERT_PEM          [${config.CERT_PEM    }]
├
│ HOST              [${config.HOST        }]
│ USER              [${config.USER        }]
│ PASSWORD          [${config.PASSWORD    }]
│ DATABASE          [${config.DATABASE    }]
│ URI_DIR           [${config.URI_DIR     }]`
;

    if(config.LOG_MORE)
        s += LF+"│ LOG_MORE    ➔➔➔ ["+    config.LOG_MORE     +"] ➔ VERBOSE node server.js";

    s += LF+"└──────────────────────────────────────────────────────────────────────────────┘";

    log_N(log_color+s);
    /*  response {{{*/
    if( response )
        response.write(
`<pre class='${config.LOAD_STATUS.includes("ERROR") ? "error" : "info"}'>${s}</pre>`
                      );

    /*}}}*/
    /*}}}*/
    /* POSTGRES {{{*/
    let postgres_args  = "["+config.HOST+"] ["+config.USER+"] ["+config.DATABASE+"]";
    let config_status  =     config.LOAD_STATUS.replace(/\n/g,"\n│ ");
    s = `
┌───────────────────────────────────────────────────────────────────── STATUS ─┐
│ ${postgres_args}
│ ${config_status}
└──────────────────────────────────────────────────────────────────────────────┘`;

    let   postgres_color = postgres_args.includes("undefined") ? R : log_color;
    log_N(postgres_color +s);

/*  response {{{*/
if( response )
    response.write(
`<pre class='${config.LOAD_STATUS.includes("ERROR") ? "error" : "info"}'>${s}</pre>`
                  );
/*}}}*/
    /*}}}*/
    /*}}}*/
    /* FOLDER {{{*/

    s = `
┌──────────────────────────────────────────────────────────────────────────────┐
│ SERVER STARTED IN ${   started_folder}
│ SERVER TOP FOLDER ${server_top_folder}
└──────────────────────────────────────────────────────────────────────────────┘`;

    log_G(s);
/*  response {{{*/
if( response )
    response.write(
`<pre class='info'>${s}</pre>`
                  );

/*}}}*/
    /*}}}*/
    /* HTTPS {{{*/

    let https_address = https_server  ?            https_server.address() : null;
    let https_port    = https_address ?            https_address.port     : null;
    let https_status  = https_port    ? (  "LISTENING PORT "+https_port ) : "NOT LISTENING";

    s =`
┌────────────────────────────────┐
│ HTTPS    :  ${https_status}
└────────────────────────────────┘`;

    log_G((https_server ? Y : R)+s+N);
/*  response {{{*/
if( response )
    response.write(
`<pre class='${https_server ? "info" : "error"}'>${s}</pre>`
                  );
/*}}}*/
    /*}}}*/
    /* HTTP  {{{*/

    let http__address = http__server  ?            http__server.address() : null;
    let http__port    = http__address ?            http__address.port     : null;
    let http__status  = http__port    ? (  "LISTENING PORT "+http__port ) : "NOT LISTENING";

    s =`
┌────────────────────────────────┐
│ HTTP     :  ${http__status}
└────────────────────────────────┘`;

    log_G((http__server ? Y : R)+s+N);
/*  response {{{*/
if( response )
    response.write(
`<pre class='${http__server ? "info" : "error"}'>${s}</pre>
<script>document.body.contentEditable = true;</script>`
                  );

/*}}}*/
    /*}}}*/

    log_net_info( response );

};
/*}}}*/
/*_ log_net_info {{{*/
let     net_address;
let log_net_info = function(response)
{
    /*  response {{{*/
    if( response )
        response.write(
`<div class='info'>
 <b>Network:</b>
 <ul>`
                      );
    /*}}}*/
    let net_if  = networkInterfaces();
    let results = Object.create({});
    for(let name of Object.keys(net_if))
    {
        for(let net of net_if[name])
        {
            if (net.family === "IPv4" && !net.internal) // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            {
                if(!results[name])
                    results[name] = [];

                results[name].push(net.address);

                if(!net_address)
                    net_address = net.address;
                /*  response {{{*/
                if( response)
                    response.write("<li>"+name+" : "+net.address+"</li>\n");
                /*}}}*/
            }
        }
    }
    /*  response {{{*/
    if( response)
        response.write("</ul>\n</div>");
    /*}}}*/
console.table( results );
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ SERVER                                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*➔ createServer .. [http__server] [https_server] {{{*/
/*{{{*/
let http__server;
let https_server;

let    started_folder;
let server_top_folder;
/*}}}*/
let createServer = function()
{
    /* [HTTP ] {{{*/
    try {
        http__server    = http .createServer();
    }
    catch(ex) { log_R(ex); }

    /*}}}*/
    /* [HTTPS] {{{*/
    try {
        let ssl_options
            = {    key: fs.readFileSync(config.KEY_PEM )
                , cert: fs.readFileSync(config.CERT_PEM)
            };
        https_server    = https.createServer( ssl_options );
    }
    catch(ex) { log_R(ex); }

    /*}}}*/
    /* FOLDER {{{*/
    started_folder      = process.cwd().replace(/\\/g,"/");
    server_top_folder   = process.cwd().replace(/\\/g,"/");

    /*}}}*/
    /* [PORT] {{{*/
    if(http__server) http__server.listen ( config.PORT_HTTP  ||  80);
    if(https_server) https_server.listen ( config.PORT_HTTPS || 443);

    if( feedback_postgres )
        feedback_postgres.configure( config );

    /*}}}*/
    /* LISTEN {{{*/
    if(http__server) http__server.addListener("request", server_request_listener.request_listener);
    if(https_server) https_server.addListener("request", server_request_listener.request_listener);

    /*}}}*/
    /* STATUS {{{*/
    log_STATUS();

    /*}}}*/
    /* WATCH SQL FOLDER {{{*/
    //watch_SQL_changes();

    /*}}}*/
    /* WATCH DOWNLOAD FOLDER {{{*/
    server_download.set_server( server );
    server_download.watch_DOWNLOAD_changes();

    /*}}}*/
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ LISTEN REQUEST                                                             │
//└────────────────────────────────────────────────────────────────────────────┘
let server_request_listener = (function() {
/*➔ request_listener {{{*/
/*{{{*/
const CLEAR_COOLDOWN = 1000;
let last_request_time= 0;

let request_count = 0;
/*}}}*/
let request_listener = function(request, response) /* eslint-disable-line complexity */
{
    /* CLEAR TERMINAL BETWEEN REQUEST CHUNKS {{{*/
    let time_now_MS = new Date().getTime();
    if((time_now_MS - last_request_time) > CLEAR_COOLDOWN) {
        if(config.LOG_MORE)
            console.log("\x1Bc➔  clear terminal between request chunks");
    }
    last_request_time = time_now_MS; // restart cooldown start time
    /*}}}*/
    /* [uri] {{{*/
    let uri = parse_url( request.url );
    if(!uri.path)
        uri.path = DEFAULT_URI_PATH;

log_C("┌──────────────────────────────────────────────────────────────────────────────┐\n"
     +"│ request_listener: ["+uri.path +"]\n"
     +"└──────────────────────────────────────────────────────────────────────────────┘");
//log_N("uri")
//console.dir( uri )
response.request_count = ++request_count;

if(config.LOG_MORE)
    console.log("REQUEST #"+response.request_count+" "+TRACE_OPEN+" uri.path=["+uri.path+"] ");//DEBUG

    let consumed_by = "";
    /*}}}*/
    //┌────────────────────────────────────────────────────────────────────────┐
    //│ SERVER: [CLEAR I18N LOG_MORE STATUS EXIT]                                            │
    //└────────────────────────────────────────────────────────────────────────┘
/*{{{*/
    let args = { uri , request , response };

    if(     !consumed_by) consumed_by = server_request_commands.request_CLEAR       ( args );
    if(     !consumed_by) consumed_by = server_request_commands.request_LOG_MORE    ( args );
    if(     !consumed_by) consumed_by = server_request_commands.request_STATUS      ( args );
    if(     !consumed_by) consumed_by = server_request_commands.request_EXIT        ( args );

/*}}}*/
    //┌────────────────────────────────────────────────────────────────────────┐
    //│ SERVER: [CONTROL]                                                      │
    //└────────────────────────────────────────────────────────────────────────┘
/*{{{*/
    if( feedback_postgres )
    {
        if( !consumed_by) consumed_by = server_request_commands.request_dump_USR_TABLES ( args );
        if( !consumed_by) consumed_by = server_request_data_io .request_data_io         ( args );
        if( !consumed_by) consumed_by =                         request_js_script       ( args );
        if( !consumed_by) consumed_by =                         request_sql_query       ( args );

    }
/*}}}*/
    //┌────────────────────────────────────────────────────────────────────────┐
    //│ SERVER: [URI]                                                          │
    //└────────────────────────────────────────────────────────────────────────┘
/*{{{*/
    if(     !consumed_by )
    {
        if(    uri.path.includes( config.URI_DIR )
            &&     fs.existsSync( config.URI_DIR )
          )
            consumed_by = server_request_uri.request_uri( args );

    }
/*}}}*/
    //┌────────────────────────────────────────────────────────────────────────┐
    //│ FALLBACK TO SERVE FILES FROM CURRENT DIRECTORY                         │
    //└────────────────────────────────────────────────────────────────────────┘
    /* 7. fs.readFile {{{*/
    if(!consumed_by && uri.path)
    {
//console.log("uri:")
//console.dir( uri  )
        let file_name = uri.path;
        if( file_name == "query")
            file_name = uri.query.match(/qtext=([^\?]+)/)[1];

//log_G("  ┌────────────────────────────────────────────────────────────────────────────┐\n"
//     +"➔ │ READFILE:\n"
//     +"  │      uri.path =["+ uri.path  +"]\n"
//     +"  │      uri.query=["+ uri.query +"]\n"
//     +"  │      file_name=["+ file_name +"]\n"
//     +"  └────────────────────────────────────────────────────────────────────────────┘");

        fs.readFile(file_name, function(err,data) { fs_read_file_callback(file_name, uri.query, response, err, data); });

        consumed_by = "fs.readFile";
    }
    /*}}}*/
//log_N("consumed_by=["+consumed_by+"]")
};
/*}}}*/
/*_ parse_url {{{*/
let parse_url = function(url)
{
    //console.log("parse_url:")
    //console.log("url:")
    //console.dir( url  )
    //console.log("decodeURIComponent(url):")
    //console.dir( decodeURIComponent(url)  )

    //..................... scheme://     domain    /path        query
    let url_match
        = decodeURIComponent(url)
        . replace(     /\+/g, " ")  // encoded space
        . replace(     /\r/g, " ")  // CR
        . replace(     /\n/g, " ")  // LF
        . replace(  /\s\s+/g, " ")  // multiple spaces
        . replace(/\s*;\s*$/,  "")  // trailing separator
        . match(/^(\w+)?(:\/\/)?([^\/]+)?\/([^\?]+)?\??(.*)?/)
    //.........(111111).........(333333)...(444444)....(55)...
    //..........scheme...........domain.....path__.....query..
    ;
    //console.log("url_match[0]:")
    //console.dir( url_match[0]  )

    return { scheme : url_match[1]
        //,      port : url_match[2]
        ,    domain : url_match[3]
        ,      path : url_match[4]
        ,     query : url_match[5]
    };
};
/*}}}*/
return { request_listener };
})();

//┌────────────────────────────────────────────────────────────────────────────┐
//│ RESPONSE URI                                                               │
//└────────────────────────────────────────────────────────────────────────────┘
let server_request_uri = (function() {
/*_ request_uri {{{*/
const FILE_HEAD_REGEXP = new RegExp(config.URI_DIR+"/(.*)/[^/]*$"); /* URI_DIR SUB-FOLDER(s) */
const FILE_NAME_REGEXP = new RegExp( ".*\\[[^\\]]*\\](.*$)"      ); /* the part after some [version] between brackets */
const FILE_UUID_REGEXP = new RegExp(      ".*\/(.*)$"            ); /* FILE NAME TAIL */
let request_uri = function(args)
{
console.log("request_uri");

    /* [config.URI_DIR] {{{*/
    let { uri,          response } = args;
//console.dir(uri);

    if(!fs.existsSync(config.URI_DIR))
    {
log_R("["+config.URI_DIR+"] NOT FOUND UNDER PROCESS CURRENT DIRECTORY ["+process.cwd()+"]");
        return null;
    }
    /*}}}*/
    /*  REGEX {{{*/
    let file_head_match   = uri.path.match( FILE_HEAD_REGEXP );
    let file_head         = file_head_match ? file_head_match[1] : "";

    let file_uuid_match   = uri.path.match( server_download.FILE_UUID_REGEXP );
    if(!file_uuid_match)
    {
log_R("["+config.URI_DIR+"] NO MATCH FOR [server_download.FILE_UUID_REGEXP]");

        return null;
    }
    let file_uuid        = file_uuid_match[1];

console.dir( { FILE_HEAD_REGEXP
             , FILE_UUID_REGEXP
             , FILE_NAME_REGEXP
             , file_head
             , file_uuid
});
/*{{{
}}}*/
    /*}}}*/
    /* SEARCH [file_path] [file_tail] .. f(file_uuid) {{{*/
    let consumed_by;

    let file_path = request_uri_search_dir(config.URI_DIR+"/"+file_head, file_uuid);
console.log("file_path=["+file_path+"]");
    if(!file_path ) return undefined;

    let file_path_match  = file_path.match( server_download.FILE_NAME_REGEXP );
    let file_tail        = file_path_match ? file_path_match[1] : "";
console.log("file_tail=["+file_tail+"]");

    if(!file_path ) return undefined;
    /*}}}*/
    /* [response] SAVE AS {{{*/
    if( response )
    {
        // [response] piggyback
/*
:!start explorer "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition"
*/
        //sponse.content_disposition =     'inline; filename="'+file_tail+'"'; // eslint-disable-line quotes
        response.content_disposition = 'attachment; filename="'+file_tail+'"'; // eslint-disable-line quotes

        fs.readFile(file_path, function(err,data) { fs_read_file_callback(file_path, uri.query, response, err, data); });

        consumed_by   = "URI: .. file_uuid=["+file_uuid+"] .. ["+file_tail+"]";

if(consumed_by) console.log( consumed_by );
        return consumed_by;
    }
    /*}}}*/
    else {
        return { file_path , file_tail };
    }
};
/*}}}*/
/*_ request_uri_search_dir {{{*/
let request_uri_search_dir = function(dir_name, file_uuid)
{
//log_Y("request_uri_search_dir("+dir_name+", "+file_uuid+")");

    /* [dir_name] {{{*/
    if(!fs.existsSync( dir_name ))
    {
log_M("["+dir_name+"] NOT FOUND");

        return null;
    }
    /*}}}*/
    let file_path;

    let                      options = { withFileTypes: true };
    fs.readdirSync(dir_name, options)
        .forEach( (dirent) => {
//log_N("...file_path=["+file_path+"] ..["+dirent.type+"] .. ["+dirent.name+"]"); // VERBOSE config.URI_DIR SEARCH
            if(!file_path) {
                /* dirent {{{*/
/*{{{
                let dirent_type
                    = dirent.isDirectory()    ? "DIR:"
                    : dirent.isFile()         ? "FILE"
                    : dirent.isSymbolicLink() ? "LINK"
                    :                           dirent["Symbol(type)"];

                let color
                    = (dirent_type == "DIR:") ? Y
                    : (dirent_type == "FILE") ? G
                    : (dirent_type == "LINK") ? C
                    :                           R;

log_N("..."+color+"["+dirent_type+"] .. ["+dirent.name+"]"); // VERBOSE config.URI_DIR SEARCH
}}}*/
                /*}}}*/
                /* DIR {{{*/
                if(dirent.isDirectory() || dirent.isSymbolicLink())
                {
                    let sub_dir_name = dir_name+"/"+dirent.name;
                    file_path = request_uri_search_dir(sub_dir_name, file_uuid);
                }
                /*}}}*/
                /* FILE {{{*/
                else {
                    if(dirent.name.startsWith( file_uuid ))
                        file_path = dir_name+"/"+dirent.name;
                }
                /*}}}*/
            }
        });

//console.log("request_uri_search_dir("+dir_name+"): ...return file_path=["+file_path+"]")
    return file_path;
};
/*}}}*/
return { request_uri };
})();

//┌────────────────────────────────────────────────────────────────────────────┐
//│ RESPONSE DATA-IN-OUT                        [lang_errors] [submit] [purge] │
//└────────────────────────────────────────────────────────────────────────────┘
let server_request_data_io = (function() {
/*_ request_data_io {{{*/
let request_data_io = function(args)
{
    let {      request, response } = args;
    let consumed_by = "";

    if(   request.url.includes("/feedback_submit")
       || request.url.includes("/feedback_purge" )
       || request.url.includes("/lang_errors"    )
       || request.url.includes("/populate_submit")
       || request.url.includes("/populate_purge" )
      ) {
log_B("  ┌───────────────────────────────────────────────┐\n"
     +"➔ │ "+request.url+" method "+ request.method +"\n"
     +"  └───────────────────────────────────────────────┘");
        if(     request.method == "POST") post_callback(request, response);
        else if(request.method == "GET" )  get_callback(request, response);
        else if(request.method == "OPTIONS")
        {
//console.dir(request)
log_Y("...allow access to the origin of the petition:");
            response.setHeader("Access-Control-Allow-Origin" , request.headers.origin);
            response.setHeader("Access-Control-Allow-Methods", "POST"                );
            response.setHeader("Access-Control-Allow-Headers", "accept, content-type");
            response.setHeader("Access-Control-Max-Age"      , "1728000"             );
            response.end();
            consumed_by = request.url;
        }

        consumed_by = request.url;
    }

    return consumed_by;
};
/*}}}*/
/*_ post_callback {{{*/
let post_callback = function(request,response)
{
//console.log("post_callback")

    let body = "";
    request.on("data", (chunk) => {
        body += chunk.toString();
    });

    request.on("end", () => {

//console.log("1 body=["+body+"]")
try {
        body = decodeURIComponent(body);
} catch(err) {
//  console.log(err);
}

//console.log("2 body=["+body+"]")

        body = body
            .replace( /\+/g     , " "   )
            .replace( /'/g      , "''"  )
            .replace( /"/g      , '""'  ) // eslint-disable-line quotes
          //.replace( /"/g      , '\\"' ) // eslint-disable-line quotes
          //.replace( /\\r\\n/g , "\n"  )
          //.replace(    /\\n/g , "\n"  )
        ;
//console.log("3 body=["+body+"]")

        handle_request(request, response, body);
    });
};
/*}}}*/
/*_ get_callback {{{*/
let get_callback = function(request,response)
{
//console.log("get_callback")

    let body =     decodeURIComponent( request.url );

    handle_request(request, response, body);
};
/*}}}*/
return { request_data_io };
})();

//┌────────────────────────────────────────────────────────────────────────────┐
//│ RESPONSE COMMAND                       [clear status dump_USR_TABLES exit] │
//└────────────────────────────────────────────────────────────────────────────┘
let server_request_commands = (function() {
/*_ request_CLEAR {{{*/
let request_CLEAR = function(args)
{
    let { uri,          response } = args;
    let consumed_by;

    if(uri.path == "clear")
    {
log_N("\x1Bc"); // CLEAR TERMINAL <esc>c
log_N("  ┌─────┐\n"
     +"➔ │ CLEAR\n"
     +"  └─────┘");
        response.writeHead(200, HTML_RESPONSE_HEADER );
        response.write("<span style='color:gray;'>...cleared</span>");
//console.log("response.request_count["+response.request_count+"] request_CLEAR"+TRACE_CLOSE)
        response.end();

        consumed_by = "clear";
    }

    return consumed_by;
};
/*}}}*/
/*_ request_LOG_MORE {{{*/
let request_LOG_MORE = function(args)
{
    let { uri,          response } = args;
    let consumed_by;

    if(uri.path == "log_more")
    {
log_N("  ┌─────────┐\n"
     +"➔ │ LOG_MORE\n"
     +"  └─────────┘");
        response.writeHead(200, HTML_RESPONSE_HEADER );

        config.LOG_MORE = !config.LOG_MORE;
        log_STATUS(response);

        response.write("<span style='color:gray;'>...log_more=["+config.LOG_MORE+"]</span>");

//console.log("response.request_count["+response.request_count+"] request_LOG_MORE"+TRACE_CLOSE)
        response.end();
        consumed_by = "log_more";
    }

    return consumed_by;
};
/*}}}*/
/*_ request_STATUS {{{*/
let request_STATUS = function(args)
{
    let { uri,          response } = args;
    let consumed_by;

    if(uri.path == "status")
    {
log_N("  ┌───────┐\n"
     +"➔ │ STATUS\n"
     +"  └───────┘");
        response.writeHead(200, HTML_RESPONSE_HEADER );

        log_STATUS(response);

//console.log("response.request_count["+response.request_count+"] request_STATUS"+TRACE_CLOSE)
        response.end();
        consumed_by = "status";
    }

    return consumed_by;
};
/*}}}*/
/*_ request_dump_USR_TABLES {{{*/
let request_dump_USR_TABLES = function(args)
{
    let { uri,          response } = args;
    let consumed_by;

    if(uri.path == "dump_USR_TABLES")
    {
log_M("  ┌─────────────────┐\n"
     +"➔ │ dump_USR_TABLES │\n"
     +"  └─────────────────┘");
        response.writeHead(200, HTML_RESPONSE_HEADER );
        response.write("<h3>"+uri.path+"</h3>");
        feedback_postgres.dump_USR_TABLES( response );

        consumed_by = "dump_USR_TABLES";
    }

    return consumed_by;
};
/*}}}*/
/*_ request_EXIT {{{*/
let request_EXIT = function(args)
{
    let { uri,          response } = args;
    let consumed_by;

    if(uri.path == "exit")
    {
log_N("  ┌─────┐\n"
     +"➔ │ exit\n"
     +"  └─────┘");
        response.writeHead(200, HTML_RESPONSE_HEADER );
        response.write("<h3 style='color:darkred;'>...terminating server</h3>");
//console.log("response.request_count["+response.request_count+"] request_EXIT"+TRACE_CLOSE)
        response.end();

        consumed_by = "SERVER PROCESS EXIT";

log_N("* "+consumed_by+" *");
        process.exit(0);
    }

    return consumed_by;
};
/*}}}*/
return {  request_CLEAR
    ,     request_EXIT
    ,     request_LOG_MORE
    ,     request_STATUS
    ,     request_dump_USR_TABLES
};
})();

//┌────────────────────────────────────────────────────────────────────────────┐
//│ RESPONSE CONTROL                                                           │
//└────────────────────────────────────────────────────────────────────────────┘
/*{{{*/
//const IFRAME_BUTTON_JS_PRETTY_PRINT =`
//<button onclick='js_pretty_print()'>JS pretty-print</button>
//`;
//
//const IFRAME_SCRIPT_JS_PRETTY_PRINT =`
//<script>
//let js_pretty_print = function()
//{
//    let pre = document.getElementById("js_code")
//    let code = pre.innerText;
//    pre.innerText = code.replace(/^/gm, "➔➔➔ ");
//};
//</script>
//`;

/*}}}*/
/*_ request_js_script {{{*/
let request_js_script = function(args) /* eslint-disable-line complexity */
{
//console.log("server.js.request_js_script");
//console.dir(args);

    let { uri, request, response } = args;
    let consumed_by;

    /* [file_name] [lang] [user_id] {{{*/
    let file_name
        = uri.path.match(/([^\/]+$)/)[1];

    let { lang , user_id  }
        = get_args_from_request_cookies({"lang":"" , "user_id":""}, request);


    /*}}}*/

    // [from_a_tool_page] {{{
    let from_a_tool_page
        =      request.headers
        &&     request.headers.referer
        && (   request.headers.referer.includes("_dev"     )
            || request.headers.referer.includes("_populate"))
    ;
console.log("from_a_tool_page=["+from_a_tool_page+"]");

    /*}}}*/

    /* GENERATE FILE */
    /*{{{*/
    if(!consumed_by
       && (   uri.path.includes(       "feedback_topics_json.js")
           || uri.path.includes(        "i18n_translate_json.js")
           || uri.path.includes( "populate_lang_key_val_json.js")
           || uri.path.includes(      "feedback_replies_json.js")
//         || uri.path.includes(                "jqgram_tree.js")
          )
      ) {
        let file_args
            = { file_name , lang , user_id };
        if( uri.path.includes("feedback_replies_json.js") )
            file_args.no_reply_ok = true;

        feedback_postgres.generate_file(file_args, response);

        consumed_by = "PUPULATE FILE";
    }
    /*}}}*/

    log_B(    "  ┌────────────────────────────────────────────────────────────────────────────┐\n"
             +"➔ │ SERVER: GENERATE FILE ["+ file_name +"]");
if(config.LOG_MORE)
    log_B(    "  │        lang=["+ lang        +"]\n"
             +"  │     user_id=["+ user_id     +"]\n"
             +"  │ consumed_by=["+ consumed_by +"]");
    log_B(    "  └────────────────────────────────────────────────────────────────────────────┘");

    return consumed_by;
};
/*}}}*/
/*_ request_sql_query {{{*/
let request_sql_query = function(args)
{
//console.log("server.js.request_sql_query")
    let { uri,          response } = args;
//console.dir(uri)
    let consumed_by;

    if(uri.path == "query")
    {
log_N("  ┌─────────┐\n"
     +"➔ │SQL query \n"
     +"  └─────────┘");
        consumed_by = "SQL query";

        response.writeHead(200, HTML_RESPONSE_HEADER  );
        /* [qtext] {{{*/
        let qtext        =            get_query_arg(uri.query, "qtext"  );
        response.as_html = JSON.parse(get_query_arg(uri.query, "as_html") || "false");
        if( qtext )
        {
            qtext = decodeURIComponent( qtext ).replace(/\+/g," "); // "+" URL ENCODED
log_N("  ┌────────────────────────────────────────────────────────────────────────────┐\n"
     +"➔ │ SERVER: "+((qtext.length < 65) ? qtext : qtext.substring(0,65)+"…")       +"\n"
     +"  └────────────────────────────────────────────────────────────────────────────┘");
console.dir(qtext);

            /* POSTGRES SQL {{{*/
            if(qtext.includes(" "))
            {
                feedback_postgres.sql_query(response, qtext);

                consumed_by = "SQL qtext";
            }
            /*}}}*/
        }
        /*}}}*/
        /* [missing args] {{{*/
        if(!consumed_by)
        {
            response.write("<pre style='color:magenta;'>QUERY MISSING ARGS IN uri.path=["+ JSON.stringify(uri.path) +"]</pre>");
//console.log("response.request_count["+response.request_count+"] request_sql_query"+TRACE_CLOSE)
            response.end();

            consumed_by = "QUERY MISSING ARGS";
        }
        /*}}}*/
    }

//console.log("consumed_by=["+consumed_by+"]");
    return consumed_by;
};
    /*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ RESPONSE FILES (async)                                                     │
//└────────────────────────────────────────────────────────────────────────────┘
/*_ fs_read_file_callback {{{*/
let fs_read_file_callback = function(file_name, query, response, err, data)
{
/* [lang] [user_id] {{{*/
    let    lang = get_query_arg(query,    "lang");
    let user_id = get_query_arg(query, "user_id");

    let  params = (user_id   ? C+     " user_id=["+ user_id   +"]" : "")
        +         (lang      ? Y+        " lang=["+ lang      +"]" : "")
    ;
log_G(G+"  ┌────────────────────────────────────────────────────────────────────────────┐\n"
     +G+"➔ │ RESPONSE FILES (async)                                                     │\n"
     +G+"  │ "+file_name+" "+params+"\n"
     +G+"  └────────────────────────────────────────────────────────────────────────────┘");

/*}}}*/
/* [err] {{{*/
    if(err) {
log_R( err );
        if(query && query.startsWith("qtext"))
        {
            response.writeHead(404, HTML_RESPONSE_HEADER );
            response.write("<pre style='background:black; color:#DDD;'>"
                           +"<b> file_name=["+    file_name +"</b>"
                           +"<b>     query=["+    query     +"</b>"
                           +LF   +JSON.stringify( err).replace(/,/g,LF+", ")
                           +"</pre>"
                          );
        }
        else {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write( "fs_read_file_callback ["+file_name+"] :\n"
                           +JSON.stringify(err)
                          );
        }
//console.log("response.request_count["+response.request_count+"] fs_read_file_callback"+TRACE_CLOSE)
        response.end();
    }
/*}}}*/
/* [data] {{{*/
    else {
        /* RESPONSE HEADER {{{*/

        let response_200_header
            = get_response_200_header(file_name);

        if( response.content_disposition )
            response_200_header["Content-Disposition"]
                = response.content_disposition; // eslint-disable-line no-useless-computed-key

        if( response.content_disposition )
            delete response.content_disposition;

        if( response_200_header )
        {
console.dir(response_200_header);

            response.writeHead(200, response_200_header);

//          log_B("response_200_header=["+
//                (      response_200_header["Content-Type"] // eslint-disable-line dot-notation
//                    || response_200_header[        "Type"] // eslint-disable-line dot-notation
//                )+"]");
        }
        /*}}}*/
        /* WRITE FILE CONTENT .. replace [127.0.0.1] with [net_address] {{{*/
        if(query && query.startsWith("qtext")) {
            response.write("<pre style='background:black; color:#DDD;'>"+data+"</pre>");
        }
        else {

            if(net_address && DEFAULT_URI_PATH.includes(file_name))
                response.write(String(data).replace(/127.0.0.1/gm, net_address));
            else
                response.write(       data);
        }
        /*}}}*/
        /* ADD HIDDEN ATTRIBUTES {{{*/
        if(    lang ) response.write("<input type='hidden' id='lang'    name='lang'    value='"+lang   +"' />");
        if( user_id ) response.write("<input type='hidden' id='user_id' name='user_id' value='"+user_id+"' />");

        /*}}}*/
//console.log("response.request_count["+response.request_count+"] fs_read_file_callback"+TRACE_CLOSE)
        response.end();
    }
/*}}}*/
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ HTTP-REQUEST                                                               │
//└────────────────────────────────────────────────────────────────────────────┘
//let server_request = (function() {
//"use strict";
/*_ handle_request {{{*/
let handle_request = function(request, response, body) // eslint-disable-line complexity
{
/*{{{*/
if(config.LOG_MORE) console.log("handle_request("+request.url+")");
//console.log("body");
//console.dir( body );
/*}}}*/
    let consumed_by;
    /* [i18n] {{{*/
    let lang_errors = get_query_arg(body, "lang_errors");
    if( lang_errors )
    {
        /* HANDLED {{{*/
        if( config.I18N_TABLE )
        {
            lang_errors = lang_errors.replace(/""/g,'"'); // eslint-disable-line quotes
//console.log("lang_errors:")
//console.dir( lang_errors )
            lang_errors = JSON.parse( lang_errors      ); // OBJECTIFY JSON STRING ARGUMENT
            handle_request_lang_errors(request,response,lang_errors);
        }
        /*}}}*/
        /* NOT HANDLED {{{*/
        else {
            response.writeHead(200, "OK", {"Content-Type": "text/html; charset=UTF-8"});

            response.write("config.I18N_TABLE IS NOT DEFINED");

//console.log("response.request_count["+response.request_count+"] handle_request"+TRACE_CLOSE)
            response.end();
        }
        /*}}}*/
        consumed_by = "lang_errors";
    }
    /*}}}*/
    /* [feedback] [populate] {{{*/
    if(!consumed_by)
    {
        /* HANDLED [user_id lang subject question feedback comment] {{{*/
        let args
            = {    user_id : get_query_arg(body, "user_id" )
                ,     lang : get_query_arg(body, "lang"    )
                ,  subject : get_query_arg(body, "subject" )
                , question : get_query_arg(body, "question")
                , feedback : get_query_arg(body, "feedback")
                ,  comment : get_query_arg(body, "comment" )
            };
/*{{{
let recap
    = "  ┌─────────────────────────────────────────────────────────────────┐\n"
    + "  │ handle_request: request=["+request.url                        +"]\n"
    + "  │ .     user_id=[" + args.user_id                               +"]\n"
    + "  │ .        lang=[" + args.lang                                  +"]\n"
    + "➔ │ .     subject=[" + args.subject                               +"]\n"
    + "  │ .    question=[" + args.question                              +"]\n"
    + "  │ .    feedback=[" + args.feedback                              +"]\n"
    + "  │ .     comment:\n"+ args.comment.replace(/^/gm,"  │         │")+ "\n"
    + "  └─────────────────────────────────────────────────────────────────┘";
log_M(recap);
}}}*/

        if     (   (request.url == "/feedback_submit")
                || (request.url == "/feedback_purge" )
               ) {
            handle_request_feedback(request,response,args);

            consumed_by = request.url;
        }
        else if(   (request.url == "/populate_submit")
                || (request.url == "/populate_purge" )
               ) {
            handle_request_populate(request,response,args);

            consumed_by = request.url;
        }
        /*}}}*/
        /* NOT HANDLED {{{*/
        else {
            response.writeHead(200, "OK", {"Content-Type": "text/html; charset=UTF-8"});

            let why_not_handled
                = (args.user_id  ? "" :  "user_id is MISSING\n")
                + (args.subject  ? "" :  "subject is MISSING\n")
                + (args.question ? "" : "question is MISSING\n")
                + (args.feedback ? "" : "feedback is MISSING\n")
            ;

            let ack_message =  why_not_handled || THANKS_FOR_YOUR_FEEDBACK;
    //console.log("...ack_message=["+ack_message+"]")

            if(request.method == "POST") {
                response.write(        ack_message );
            }
            else {
                response.write("<pre>"+ack_message+"</pre>");
                response.write("✔ <button onclick='history.go(-1);'>←</button>");
            }

            //console.log("response.request_count["+response.request_count+"] handle_request"+TRACE_CLOSE)
            response.end();

            consumed_by = "NOT HANDLED: ["+request.url+"]";
        }
        /*}}}*/
    }
    /*}}}*/

//console.log("consumed_by=["+consumed_by+"]")
};
/*}}}*/
/*_ handle_request_feedback {{{*/
let handle_request_feedback = function(request,response,args)
{
if(config.LOG_MORE) console.log("handle_request_feedback: config.FEEDBACK_TABLE=["+config.FEEDBACK_TABLE+"]");
if(config.LOG_MORE) console.dir( args );

    args.subject  = args.subject .replace(  /;/g , ",,"     );
    args.question = args.question.replace(  /;/g , ",,"     );
    args.comment  = args.comment .replace(  /;/g , ",,"     );
    args.comment  = args.comment .replace( /""/g , '\\"\\"' ); /* eslint-disable-line quotes */

    let purging   = request.url.includes("purge");

    let sql       =      server_sql.delete_FROM_FEEDBACK_TABLE(config,args);

    if( !purging )
        sql      += LF + server_sql.insert_INTO_FEEDBACK_TABLE(config,args);

if(config.LOG_MORE) console.log("➔ sql=["+sql+"]");

    response.writeHead(200, "OK", {"Content-Type": "text/html; charset=UTF-8"});
    try {
        feedback_postgres.sql_query(response, sql);
    }
    catch(ex)
    {
        console.log("response.request_count["+response.request_count+"] handle_request_feedback"+TRACE_CLOSE);//DEBUG
        response.end();
        console.dir(ex);
    }
};
/*}}}*/
/*_ handle_request_lang_errors {{{*/
let handle_request_lang_errors = function(request,response,lang_errors)
{
//console.log("handle_request_lang_errors: config.I18N_TABLE=["+config.I18N_TABLE+"]")

    /* [lang_errors] {{{*/
    let recap
        =  "  ┌──────────────────────────────────────────────────────────────────┐\n"
        +  "  │ handle_request_lang_errors: request=["+request.url +"]\n"
        +  "  │ ...MISSING LANG TERMS (x"+lang_errors.length       +")\n"
        +  "  │──────────────────────────────────────────────────────────────────┤\n"
    ;

    for(let k=0; k<lang_errors.length; ++k)
    {
        let          count = (k<9 ? " ":"")+(k+1);
        recap
        += "  │"+count+": "+lang_errors[k].lang+": "+lang_errors[k].miss+"\n";
    }
    recap
        += "  └─────────────────────────────────────────────────────────────────┘";

    log_M(recap);
    /*}}}*/

    let sql = "";
    for(let k=0; k<lang_errors.length; ++k)
    {

//        let lng = lang_errors[k].lang;
//        let key = lang_errors[k].miss;
//        let val =                  ""; // assumed to be a missing translation when part of [lang_errors]
//        if( lng )
//            sql +=
//`INSERT INTO    ${config.I18N_TABLE}
//        values('${lng}', '${key}', '${val}')
//        ON CONFLICT DO NOTHING;\n`;

        let args = { lang : lang_errors[k].lang
            ,         key : lang_errors[k].miss
            ,         val : ""
        };
        sql += LF + server_sql.insert_INTO_I18N_TABLE(config,args);
    }
//log_G("v v v v v v v v v v v v v v v v v v v v")
//log_Y(sql)
//log_G("^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^")

    response.writeHead(200, "OK", {"Content-Type": "text/html; charset=UTF-8"});
    try {
        feedback_postgres.sql_query(response, sql);
    }
    catch(ex)
    {
        console.log("response.request_count["+response.request_count+"] handle_request_lang_errors"+TRACE_CLOSE);//DEBUG
        response.end();
        console.dir(ex);
    }
};
/*}}}*/
/*_ handle_request_populate {{{*/
let handle_request_populate = function(request,response,args)
{
//console.log("handle_request_populate: config.I18N_TABLE=["+config.I18N_TABLE+"]")
    args          = { lang : args.subject .replace(/;/g,",,")
        ,              key : args.question.replace(/;/g,",,")
        ,              val : args.comment .replace(/;/g,",,")
    };
//console.dir(args)

    let purging   = request.url.includes("purge");

    let sql       =      server_sql.delete_FROM_I18N_TABLE(config,args);

    if( !purging )
        sql      += LF + server_sql.insert_INTO_I18N_TABLE(config,args);

//console.log("sql=["+sql+"]")

    response.writeHead(200, "OK", {"Content-Type": "text/html; charset=UTF-8"});
    try {
        feedback_postgres.sql_query(response, sql);
    }
    catch(ex)
    {
        console.log("response.request_count["+response.request_count+"] handle_request_populate"+TRACE_CLOSE);//DEBUG
        response.end();
        console.dir(ex);
    }
};
/*}}}*/
//return { handle_request
//    ,    handle_request_feedback
//    ,    handle_request_lang_errors
//    };
//})();

/*_ get_query_arg {{{*/
let get_query_arg = function(query, arg)
{
    //log_N(query)
    //log_N(arg  )
    if(!query || !arg) return "";

    let    query_regexp = new RegExp(arg+"=([^&]*)");
    let    query_match  = query.match(query_regexp);
    return query_match  ? query_match[1] : "";
};
/*}}}*/
/*_ get_args_from_request_cookies {{{*/
let get_args_from_request_cookies = function(args,request)
{
    let cookies = request.headers.cookie ? request.headers.cookie.split("; ") : "";
    if( cookies )
    {
        for(let c=0; c<cookies.length; ++c)
        {
            for(let k=0; k < Object.keys(args).length; ++k)
            {
                let key    = Object.keys(args)[k];
                if(cookies[c].startsWith(key+"="))
                    args[key] = cookies[c].substring(key.length +1);
            }
        }
    }

    return args;
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ HTTP-RESPONSE HEADER                                                       │
//└────────────────────────────────────────────────────────────────────────────┘
/* Content-Type HEADERS {{{*/
const     JS_RESPONSE_HEADER = { "Content-Type" : "text/javascript;"   };
const    CSS_RESPONSE_HEADER = { "Content-Type" : "text/css;"          };
const    CSV_RESPONSE_HEADER = { "Content-Type" : "text/csv;"          };
const    DOC_RESPONSE_HEADER = { "Content-Type" : "application/msword" };
const    ICO_RESPONSE_HEADER = { "Content-Type" : "image/x-icon"       };
const    JPG_RESPONSE_HEADER = { "Content-Type" : "image/jpeg"         };
const    PDF_RESPONSE_HEADER = { "Content-Type" : "application/pdf"    };
const    PPT_RESPONSE_HEADER = { "Content-Type" : "vnd.ms-powerpoint"  };
const    XLS_RESPONSE_HEADER = { "Content-Type" : "application/vnd.ms-excel" };
const   XLSX_RESPONSE_HEADER = { "Content-Type" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
const   HTML_RESPONSE_HEADER = { "Content-Type" : "text/html;  charset=UTF-8", "Access-Control-Allow-Origin" : "*" };
const   DEFAULT_TEXT_PLAIN   = { "Content-Type" : "text/plain; charset=UTF-8" };
const   DEFAULT_OCTET_STREAM = { "Content-Type" : "application/octet-stream"  };

/*
:!start explorer "https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types"
 */
/*}}}*/
/*_ get_response_200_header {{{*/
let get_response_200_header = function(_file_name)
{
    let file_name = _file_name.toLowerCase();

    return (file_name.endsWith("js"     )) ?   JS_RESPONSE_HEADER
        :  (file_name.endsWith("css"    )) ?  CSS_RESPONSE_HEADER
        :  (file_name.endsWith("csv"    )) ?  CSV_RESPONSE_HEADER
        :  (file_name.endsWith("doc"    )) ?  DOC_RESPONSE_HEADER
        :  (file_name.endsWith("docx"   )) ?  DOC_RESPONSE_HEADER
        :  (file_name.endsWith("ico"    )) ?  ICO_RESPONSE_HEADER
        :  (file_name.endsWith("jpg"    )) ?  JPG_RESPONSE_HEADER
        :  (file_name.endsWith("pdf"    )) ?  PDF_RESPONSE_HEADER
        :  (file_name.endsWith("ppt"    )) ?  PPT_RESPONSE_HEADER
        :  (file_name.endsWith("xls"    )) ?  XLS_RESPONSE_HEADER
        :  (file_name.endsWith("xlsx"   )) ? XLSX_RESPONSE_HEADER
        :  (file_name.endsWith("htm"    )) ? HTML_RESPONSE_HEADER
        :  (file_name.endsWith("html"   )) ? HTML_RESPONSE_HEADER
        :  (file_name.endsWith("txt"    )) ? DEFAULT_TEXT_PLAIN   // FALLBACK (TXT)
        :                                    DEFAULT_OCTET_STREAM // FALLBACK (OTHER)
    ;

};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ PUBLIC INTERFACE                                                           │
//└────────────────────────────────────────────────────────────────────────────┘
return { config , createServer };

})();

server.createServer();







