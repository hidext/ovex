// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define('scrummer.helpers', function (require) {
    "use strict";
    const _t = require("web.core")._t;
    require("web.dom_ready");

    const time = {
        parse: function (val) {
            //console.log("parse_value");
            let ret = 0;
            const time_map = {
                m: 1,
                h: 60,
                d: 480,
                w: 2400,
                y: 124800
            };
            try {

                const time_parts = val.split(" ");
                time_parts.forEach(function (time_part, index, array) {
                    if (time_part.length) {
                        const number_part = time_part.slice(0, -1);
                        const last_char = time_part.slice(-1);
                        if (time_map[last_char] && !isNaN(number_part) && parseInt(number_part, 10) > 0) {
                            // ako je validan part
                            ret += number_part * time_map[last_char];
                        } else if (index === array.length - 1 && !isNaN(time_part) && parseInt(time_part, 10) > 0) {
                            // ako je poslednji u nizu i prirodan je broj
                            // moze i bez oznake, a pdrazumeva se minut.
                            ret += parseInt(time_part, 10);
                        } else {
                            throw new Error();
                        }
                    }
                });
            } catch (err) {
                throw new Error(_t("Wrong time duration format!"));
            }

            return ret / 60;
        },
        format: function (val) {
            //console.log("format_value");
            // convert from hours to minutes
            let temp_val = val * 60;
            const ret_array = [];
            const time_map_inverse = {
                124800: "y",
                2400: "w",
                480: "d",
                60: "h",
                1: "m"
            };
            const time_chunks = Object.keys(time_map_inverse).sort(function (a, b) {
                return b - a;
            });
            for (const p in time_chunks) {
                /* eslint-disable no-bitwise */
                const chunk = parseInt(time_chunks[p], 10);
                const chunk_count = temp_val / chunk >> 0;
                if (chunk_count) {
                    ret_array.push(chunk_count + time_map_inverse[chunk]);
                }
                temp_val %= chunk;
            }
            return ret_array.join(" ");
        },
        valid: function (val) {
            try {
                this.parse(val);
                return true;
            } catch (e) {
                return false;
            }
        },
        parseOrFalse: function (val) {
            try {
                return this.parse(val);
            } catch (e) {
                return false;
            }
        }
    };
    $.validator.addMethod("scrummer.time", function (value, element) {
        return this.optional(element) || time.valid(value);
    }, "Please specify correct form, e.g. 1d 3h 15m");
    return {
        time,
    };
});
