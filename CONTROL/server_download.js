//┌────────────────────────────────────────────────────────────────────────────┐
//│ [server_download]                                     _TAG (210914:01h:43) │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  require, process, module */
/* globals  console, setTimeout, clearTimeout */
/* eslint-disable no-warning-comments */
/*}}}*/
let server_download = (function() {
"use strict";

//┌────────────────────────────────────────────────────────────────────────────┐
//│ LOG                                                                        │
//└────────────────────────────────────────────────────────────────────────────┘
//➔ ANSII-TERMINAL {{{*/
//nst    LF = String.fromCharCode(10);
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
//t log_M = function(arg0, ...rest) { log_X([ M + arg0, ...rest]); };
let log_Y = function(arg0, ...rest) { log_X([ Y + arg0, ...rest]); }; // eslint-disable-line no-unused-vars

let log_N = function(arg0, ...rest) { log_X([ N + arg0, ...rest]); };

/*}}}*/
//➔ REQUIRE {{{*/

//➔ [fs]
//{{{
let   fs                        = require("fs"   );
//}}}

/*}}}*/
/* ➔ INTERN [server] {{{*/
/*{{{*/
let config = {};

/*}}}*/
let set_server = function(server)
{
//console.log("set_server:")
//console.dir( server )

    config         = server.config;

//console.dir( config )
};
/*}}}*/

//┌────────────────────────────────────────────────────────────────────────────┐
//│ [DOWNLOAD FOLDER] WATCHER                                                  │
//└────────────────────────────────────────────────────────────────────────────┘
/* URI_DIR REGEX DOWNLOAD_LOG_FILE_NAME DOWNLOAD_FILE {{{*/

const DOWNLOAD_FOLDER         = "Download";
const DOWNLOAD_LOG_FILE_NAME  = DOWNLOAD_FOLDER+"/index.html";

const DOWNLOAD_FILE_DELAY     = 1000;
const DOWNLOAD_FILE_WAS_THERE = "file_was_there";
const DOWNLOAD_FILE_ISLOADING = "file_isloading";

const  CSV_LIST_REGEXP = new RegExp("^(.*\.csv)$"                ); /* watched folder top level csv file (not some of further downloaded ones) */
const    FOLDER_REGEXP = new RegExp( "^([^\/]*)\/"               ); /* FOLDER=UP TO FIRST [SLASH] */
const  FILE_URL_REGEXP = new RegExp( '(https?:[^"]+)"'           ); /* [http] UP TO  NEXT [QUOTE] */ // eslint-disable-line quotes
const FILE_NAME_REGEXP = new RegExp( ".*\\[[^\\]]*\\](.*$)"      ); /* the part after some [version] between brackets */
const FILE_PATH_REGEXP = new RegExp( '.*","\/?(.*)"$'            ); /*      last [QUOTED COLUMN] */ // eslint-disable-line quotes
const FILE_TAIL_REGEXP = new RegExp(      "([^\/]*)$"            ); /*    last [NO_SLASH STRING] */
const FILE_UUID_REGEXP = new RegExp(      ".*\/(.*)$"            ); /* FILE NAME TAIL */

/*}}}*/
/*➔ watch_DOWNLOAD_changes {{{*/
/*{{{*/
let   download_file_timeout;
let   fsWatcher;
let   download_folder;

/*}}}*/
let watch_DOWNLOAD_changes = function()
{
console.log("watch_DOWNLOAD_changes");

    if( fsWatcher ) return;

    make_DOWNLOAD_folder();
    if(!fs.existsSync(download_folder) ) return;

    log_N( M+"┌─────────────────────────────────────── watch_DOWNLOAD_changes ─┐\n"
          +M+"│ WATCHING DOWNLOAD FOLDER:                                      │\n"
          +M+"│ "+M+ download_folder                                          +"\n"
          +M+"└────────────────────────────────────────────────────────────────┘");

    fsWatcher = fs.watch( download_folder
                        , { encoding: "buffer" , recursive: true }
                        , watch_DOWNLOAD_changes_handler
                        );
};
/*}}}*/
/*_ watch_DOWNLOAD_changes_handler {{{*/
let watch_DOWNLOAD_changes_handler = function(eventType, _file_name)
{
console.log("watch_DOWNLOAD_changes_handler");

    /* CSV FILE FROM [download_folder] */
    let csv_list_file  = String(_file_name).replace(/\\/g,"/");
    let csv_list_match = csv_list_file.match( CSV_LIST_REGEXP );
    csv_list_file      = csv_list_match ? csv_list_match[1] : "";

    if(!csv_list_file.endsWith(".csv")) return;
console.log("csv_list_file=["+csv_list_file+"]");

    /* FILE REMOVED */
    csv_list_file = download_folder+"/"+csv_list_file;
    if( !fs.existsSync(csv_list_file) ) return;

    /* FILE CHANGED */
    let msg  = "FILE HAS CHANGED: ["+ csv_list_file  +"]";
log_B(msg+" "+R+" (eventType .. "+eventType+")");

    /* DOWNLOAD FILE */
    if(download_file_timeout)
        clearTimeout( download_file_timeout );

    download_file_timeout
        = setTimeout( function() { fs.readFile(  csv_list_file
                                                 , function(err, data) {
                                                     if(err) log_R( err );
                                                     else    download_csv_list_file(csv_list_file, data);
                                                 });
        }, DOWNLOAD_FILE_DELAY);
};
/*}}}*/
/*_ make_DOWNLOAD_folder {{{*/
let make_DOWNLOAD_folder = function()
{
    /* NOT REQUIRED */
    if( !config.URI_DIR        ) return;

    if( !config.URI_DIR_TARGET ) return;

    download_folder = process.cwd().replace(/\\/g,"/")+"/"+DOWNLOAD_FOLDER;
    if(!fs.existsSync(download_folder) )
        fs.mkdirSync( download_folder );

    log_N( M+"┌───────────────────────────────────────── make_DOWNLOAD_folder ─┐\n"
          +M+"│ URI DIR TARGET...: ["+ config.URI_DIR_TARGET                 +"]\n"
          +M+"│ URI DIR LINK.....: ["+ config.URI_DIR                        +"]\n"
          +M+"└────────────────────────────────────────────────────────────────┘");

    /* OR ALL DONE ALREADY */
    if( fs.existsSync( config.URI_DIR) ) return;

    log_N( Y+"┌─────────────────────────┐\n"
          +Y+"│ SYMBOLIC DIR-LINK ADDED │\n"
          +Y+"└─────────────────────────┘");

    fs.symlinkSync(config.URI_DIR_TARGET, config.URI_DIR, "dir"); /* [file || dir || junction] */

};
/*}}}*/
/*_ download_csv_list_file {{{*/
/*{{{*/
const DOWNLOAD_FILE_LOG_SAVE_DELAY = 2000;
let   download_log_save_timeout;
let   download_log = "";

/*}}}*/
let download_csv_list_file = function(csv_list_file, data)
{

    if(download_log_save_timeout)
        clearTimeout( download_log_save_timeout );

    /* READ THE LIST OF FILE NAMES TO DOWNLOAD FROM CSV FILE {{{*/
    let data_str = String(data);

let msg = "downloading files from list ["+csv_list_file+"]: "+ data_str.length +"b";
log_B(msg);
download_log += msg+"\n";

    let line_separator = (data_str.indexOf("\r") > 0) ? "\r\n" : "\n";
    let lines          =  data_str.split( line_separator );
    let count = 0;
    /*}}}*/
    let download_line_log = "";
    let download_action;
    for(let i = 0; i < lines.length; ++i) {
/* LOG {{{*/
if( download_line_log ) {
    download_file_log_add(download_line_log, download_action);
    download_line_log  = "";
}
/*}}}*/
        /* [folder] [url] [path] [tail] {{{*/
        download_action = undefined;

        let file_url_match      = lines[i] .match (  FILE_URL_REGEXP );
        let file_url            = file_url_match  ?  file_url_match[1] : "";
        if(!file_url) continue;

        let file_path_match     = lines[i] .match ( FILE_PATH_REGEXP );
        let file_path           = file_path_match ? file_path_match[1] : "";

        let folder_match        = file_path.match (    FOLDER_REGEXP );
        let folder              = folder_match    ?    folder_match[1] : "";

        let file_tail_match     = file_path.match ( FILE_TAIL_REGEXP );
        let file_tail           = file_tail_match ? file_tail_match[1] : "";

        let file_uuid_match     = file_url.match  ( FILE_UUID_REGEXP );
        let file_uuid           = file_uuid_match ? file_uuid_match[1] : "";

        let file_uuid_path      = request_uri_search_dir(config.URI_DIR+"/"+folder, file_uuid);

        /*}}}*/
/* LOG {{{*/
msg = i+" "+file_tail;
//console.dir(msg)
download_line_log += "<summary>"+msg+"</summary>";

msg = { folder
    ,   file_url
    ,   file_tail
    ,   file_path
    ,   file_uuid_path
};
//console.dir(msg)
msg = JSON.stringify(msg).replace(/([\{,])/g,"\n│ $1");
download_line_log += msg+"\n";
/*}}}*/
        /* [file_uuid_path] {{{*/
        if(!file_uuid_path )
        {
/* LOG {{{*/
msg = "...NO [file_uuid_path] in ["+config.URI_DIR+"] DIRECTORY for file_tail=["+file_tail+"]";
console.dir(msg);
download_line_log += msg+"\n";

/*}}}*/
        }
        /*}}}*/
        else {
            /* [download_action] {{{*/
            count += 1;
            let download_to_folder  = download_folder+"/"+folder;
/* LOG {{{*/
msg ="download_to_folder=["+download_to_folder+"]";
//console.log(msg)
download_line_log += msg+"\n";

/*}}}*/
            let download_to_path    = download_to_folder+"/"+file_tail;
/* LOG {{{*/
msg = "download_to_path=["+download_to_path+"]";
//console.log(msg)
download_line_log += msg+"\n";

/*}}}*/
            if( fs.existsSync(download_to_path) )
            {
                download_action = DOWNLOAD_FILE_WAS_THERE;
/* LOG {{{*/
msg = "item #"+i+" .. download #"+count+" ["+file_tail+"] "+download_action;
console.log(msg);
download_line_log += msg+"\n";

/*}}}*/
            }
            /*}}}*/
            else {
                /* [download_to_folder] {{{*/
                if(!fs.existsSync(download_to_folder) )
                {
                    let to_folder_dir = fs.mkdirSync(download_to_folder, { recursive: true }); // recursiv (to get first dir)

log_G("CREATED [to_folder_dir]=["+to_folder_dir+"]");
                }
                /*}}}*/
                /* [copyFile] {{{*/
                let src =   file_uuid_path;
                let dst =   download_to_path;
                fs.copyFile(src, dst
                             , function(err) {
                                 if(err) { log_R(err); download_file_log_add(err, "error"); }
                                 else      log_Y(".......DOWNLOADED....=["+dst+"]");
                             });

                download_action = DOWNLOAD_FILE_ISLOADING;
/* LOG {{{*/
msg = { download_to_folder
      , download_to_path
      , download_action
};
console.dir(msg);
download_line_log += JSON.stringify(msg).replace(/([\{,])/g,"\n│ $1")+"\n<hr>";

/*}}}*/
                /*}}}*/
            }
        }
    }
    /* LOG {{{*/
    if(download_line_log) {
        download_file_log_add(download_line_log, download_action);
        download_line_log  = "";
    }

    download_log_save_timeout
        = setTimeout(download_log_save, DOWNLOAD_FILE_LOG_SAVE_DELAY);
    /*}}}*/
};
/*}}}*/
/*_ request_uri_search_dir {{{*/
let request_uri_search_dir = function(dir_name, file_uuid)
{
    if(!fs.existsSync( dir_name )) return null;

    let file_path;
    fs.readdirSync(dir_name, { withFileTypes: true })
        .forEach( (dirent) => {
            if(!file_path) {
                if(dirent.isDirectory() || dirent.isSymbolicLink())
                {
                    let sub_dir_name = dir_name+"/"+dirent.name;
                    file_path = request_uri_search_dir(sub_dir_name, file_uuid);
                }
                else {
                    if(dirent.name.startsWith( file_uuid ))
                        file_path = dir_name+"/"+dirent.name;
                }
            }
        });
    return file_path;
};
/*}}}*/
/*_ download_file_log_add {{{*/
let download_file_log_add = function(download_line_log, download_action)
{
    let className =  download_action;
    let      open = (download_action) ? "" : "open";
    download_log += "<details class='"+className+"' "+open+">"+download_line_log+"</details>";
};
/*}}}*/
/*_ download_log_save {{{*/
let download_log_save = function()
{
    download_log_save_timeout = null;

    if( !download_log ) return;

    /* CREATE DOWNLOAD_LOG_FILE_NAME {{{*/
    if(!fs.existsSync( DOWNLOAD_LOG_FILE_NAME))
    {
        let msg = `
<!DOCTYPE html>
<html lang="en">
 <head>
  <meta charset="utf-8">
  <title>${DOWNLOAD_LOG_FILE_NAME}</title>
  <style>
  button                    { background-color: #DFD; }
  details                   { cursor          : pointer; }
  details                   { border          : solid 1px black; }
  details:nth-of-type(5n)   { margin-bottom   : 1.0em;  }
  summary                   { user-select     : none; }
  .file_was_there           { background      : linear-gradient(to right, #FF0, #FFF); }
  .file_isloading           { background      : linear-gradient(to right, #0F0, #FFF); }
  .undefined                { background      : linear-gradient(to right, #F00, #AAA); }
  .error                    { background      : linear-gradient(to right, #F00, #A00); }
  </style>
 </head>
`;
        fs.writeFileSync(DOWNLOAD_LOG_FILE_NAME, msg);
        log_C("..."+DOWNLOAD_LOG_FILE_NAME+" CREATED");
    }
    /*}}}*/
    /* APPEND download_log {{{*/
    let date =    new Date();
    let time =   date.getFullYear()
        +"/"+(1+ date.getMonth   ())
        +"/"+    date.getDate    ()
        +" "+    date.getHours   ()
        +":"+    date.getMinutes ()
        +":"+    date.getSeconds ();

    let msg = `

<details> <summary><button onclick='location.reload();' title="reload">&#x21bb;</button> ${time}</summary>
<pre>
 ${download_log}
</pre>
</details>
`;

    fs.appendFileSync(DOWNLOAD_LOG_FILE_NAME, msg);

    download_log = "";

    log_Y("..."+DOWNLOAD_LOG_FILE_NAME+" UPDATED");
    /*}}}*/

};
/*}}}*/


    return { set_server
        ,    watch_DOWNLOAD_changes
        ,    FILE_NAME_REGEXP
        ,    FILE_UUID_REGEXP
    };

})();

try { module.exports = server_download; } catch(ex) { console.log(ex); } /* server.js require */

