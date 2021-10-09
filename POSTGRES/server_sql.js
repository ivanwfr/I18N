//┌────────────────────────────────────────────────────────────────────────────┐
//│ [server_sql] .. [DELETE] [INSERT]                     _TAG (210914:01h:44) │
//└────────────────────────────────────────────────────────────────────────────┘
/* jshint esversion 9, laxbreak:true, laxcomma:true, boss:true */ /*{{{*/
/* globals  module */
/* globals  console */ /* eslint-disable-line no-unused-vars */
/* eslint-disable no-warning-comments */
/*}}}*/
let server_sql = (function() {
"use strict";

let delete_FROM_FEEDBACK_TABLE = function(config, args) //{{{
{
if(config.LOG_MORE)
    console.log("delete_FROM_FEEDBACK_TABLE");

    return `DELETE FROM ${config.FEEDBACK_TABLE}
        WHERE  user_id='${args.user_id         }'
        AND    subject='${args.subject         }'
        AND   question='${args.question        }';`
    ;

}; //}}}
let insert_INTO_FEEDBACK_TABLE = function(config, args) //{{{
{
if(config.LOG_MORE)
    console.log("insert_INTO_FEEDBACK_TABLE");

    return `INSERT INTO ${config.FEEDBACK_TABLE}
                values('${args.user_id         }',
                       '${args.subject         }',
                       '${args.question        }',
                       '${args.feedback        }',
                       '${args.comment         }');`
    ;

};//}}}

let delete_FROM_I18N_TABLE = function(config, args) //{{{
{
if(config.LOG_MORE)
    console.log("delete_FROM_I18N_TABLE");

    return `DELETE FROM ${config.I18N_TABLE}
             WHERE lang='${args.lang       }'
             AND    key='${args.key        }';`
    ;

}; //}}}
let insert_INTO_I18N_TABLE = function(config, args) //{{{
{
if(config.LOG_MORE)
    console.log("insert_INTO_I18N_TABLE");

    return `INSERT INTO ${config.I18N_TABLE}
                values('${args.lang        }',
                       '${args.key         }',
                       '${args.val         }')
                ON CONFLICT DO NOTHING;`
    ;

};//}}}
let append_INTO_I18N_TABLE = function(config, args) //{{{
{
if(config.LOG_MORE)
    console.log("append_INTO_I18N_TABLE");

    return `INSERT INTO ${config.I18N_TABLE}
                values('${args.lang        }',
                       '${args.key         }',
                       '${args.val         }')
                ON CONFLICT DO NOTHING;`
    ;

};//}}}

return { delete_FROM_FEEDBACK_TABLE
    ,    insert_INTO_FEEDBACK_TABLE

    ,    delete_FROM_I18N_TABLE
    ,    insert_INTO_I18N_TABLE
    ,    append_INTO_I18N_TABLE
};

})();

try { module.exports = server_sql; } catch(ex) {} /* server.js require */

/*
:new %:h/../../GITLAB/user_feedback/requetes.sql
*/
