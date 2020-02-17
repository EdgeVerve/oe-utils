/**
 * @license
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
 */

// date parse module.

window.OEUtils = window.OEUtils || {};
var OEUtils = window.OEUtils;
OEUtils.DateUtils = {
  months: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
};

OEUtils.DateUtils.utcDateFormatter = (function () {

  var locale = navigator.language;
  return Intl.DateTimeFormat(locale, {
    timeZone: 'UTC'
  });
})();

OEUtils.DateUtils.parse = function (dateStr, dateFormat) {
  if (typeof dateStr === 'undefined' || dateStr.length < 4) {
    return;
  }
  if (!dateFormat) {
    dateFormat = "DD-MM-YYYY";
  }
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  dateStr = dateStr.toLowerCase();
  OEUtils.DateUtils.months.forEach(function (d) {
    if (dateStr.indexOf(d) > -1) {
      dateStr = dateStr.replace(d, months.indexOf(d) + 1);
    }
  });
  let separator = "-";    //Fix separator to handle multiple separator in format
  dateStr = dateStr.replace(/[^0-9]/g, separator);
  dateFormat = dateFormat.replace(/[^DMY]/g, separator);
  let hasSeparator = dateStr.indexOf(separator) !== -1;   //Check if format is like DDMMYYYY
  var dateMap = {
    d: -1,
    m: -1,
    y: -1
  };
  let format = dateFormat.toLowerCase();
  var isUSFormat = format.indexOf('dd') > format.indexOf('mm');
  if (hasSeparator) {
    let dateSegments = dateStr.split(separator);
    //Populates date/month and year value into dateMap object.
    format.split(separator).forEach((k, i) => {
      dateMap[k[0]] = parseInt(dateSegments[i]);  //k[0] will be 'd','m','y'
    });
  } else {

    if (dateStr.length === format.length) {
      //Scenario dateFormat:MMDDYYYY and dateStr:03012020
      let reg = new RegExp(/(d+)|(m+)|(y+)/, 'g');
      let strArr = dateStr.split('');
      format.match(reg).forEach(k => {
        let dateSeg = strArr.splice(0, k.length).join('');
        dateMap[k[0]] = parseInt(dateSeg);
      });
    } else {
      let day, month, year;
      if (isUSFormat) {
        //Date string will have month before date
        switch (dateStr.length) {
          case 4:
            //date string is 'MDYY'
            month = '0' + dateStr.slice(0, 1);
            day = '0' + dateStr.slice(1, 2);
            year = dateStr.slice(2, 4);
            break;
          case 6:
          case 8:
            //date string is 'DMYYYY'
            month = '0' + dateStr.slice(0, 2);
            day = '0' + dateStr.slice(2, 4);
            year = dateStr.slice(4);
            break;
          case 5:
          case 7:
            if (dateStr.length == 5) {
              //date string is 'MMDYY' or 'MDDYY'
              year = dateStr.slice(3, 5);
            } else {
              //date string is 'MMDYYYY' or 'MDDYYYY'
              year = dateStr.slice(3, 7);
            }
            let a = parseInt(dateStr.slice(0, 1));
            let b = parseInt(dateStr.slice(1, 2));
            let c = parseInt(dateStr.slice(2, 3));
            if (a >= 2 || (c === 0 && a !== 0) || b > 2) {
              //format is 'MDD'
              month = '0' + dateStr.slice(0, 1);
              day = dateStr.slice(1, 3);
            } else if (a === 0) {
              //format is 'MMD'
              month = dateStr.slice(0, 2);
              day = '0' + dateStr.slice(2, 3);
            }
            break;

        }
      } else {
        //Date string will have date before month
        switch (dateStr.length) {
          case 4:
            //date string is 'DMYY'
            day = '0' + dateStr.slice(0, 1);
            month = '0' + dateStr.slice(1, 2);
            year = dateStr.slice(2, 4);
            break;
          case 6:
          case 8:
            //date string is 'DMYYYY'
            day = '0' + dateStr.slice(0, 2);
            month = '0' + dateStr.slice(2, 4);
            year = dateStr.slice(4);
            break;
          case 5:
          case 7:
            if (dateStr.length == 5) {
              //date string is 'DMMYY' or 'DDMYY'
              year = dateStr.slice(3, 5);
            } else {
              //date string is 'DMMYYYY' or 'DDMYYYY'
              year = dateStr.slice(3, 7);
            }
            let a = parseInt(dateStr.slice(0, 1));
            let b = parseInt(dateStr.slice(1, 2));
            let c = parseInt(dateStr.slice(2, 3));
            let nextTwo = parseInt(dateStr.slice(1, 3));

            if (a >= 4) {
              day = '0' + dateStr.slice(0, 1);
              month = dateStr.slice(1, 3);
            } else if (c === 0) {
              day = '0' + dateStr.slice(0, 1);
              month = dateStr.slice(1, 3);
            } else if (a <= 3 && a !== 0 && b === 1 && c <= 2) {
              //conflict = true;
              break;
            } else if (nextTwo > 12 || (a >= 0 && b >= 0 && c >= 1)) {
              day = dateStr.slice(0, 2);
              month = '0' + dateStr.slice(2, 3);
            }
            break;

        }
      }
      dateMap = {
        y: parseInt(year),
        d: parseInt(day),
        m: parseInt(month)
      }
    }
  }
  dateMap.m -= 1;
  if (dateMap.y < 70) {
    dateMap.y += 2000;
  } else if (dateMap.y <= 99) {
    dateMap.y += 1900;
  }


  var result;
  if (dateMap.m >= 0 && dateMap.m <= 11 && dateMap.d > 0 && dateMap.d <= 31) {

    //UTC
    var result = new Date(Date.UTC(dateMap.y, dateMap.m, dateMap.d));

    //if date is more than number of dateMap.ds in dateMap.m, the dateMap.m is incremented.
    if (result.getUTCMonth() !== dateMap.m || result.getUTCFullYear() !== dateMap.y) {
      result = undefined;
    }
  }
  return result;
}


OEUtils.DateUtils.format = function (date, format, locale) {
  if (!format) {
    return date;
  }
  if (!date) {
    return '';
  } else if (typeof date === 'number') {
    date = new Date(date);
  } else if (typeof date === 'string') {
    date = new Date(date);
  }
  if (format === 'l') {
    format = 'MM/DD/YYYY';
  }
  return format.replace(/([a-zA-Z]+)/g, function ($1) {
    return getFormat(date, $1, locale);
  });
};

function getFormat(date, format, locale) {
  if (!locale) {
    locale = navigator.language;
  }
  var formatOption = {
    timeZone: "UTC"
  };

  switch (format) {
    case "D":
      formatOption.day = "numeric"; break;
    case "DD":
      formatOption.day = "2-digit"; break;
    case "M":
      formatOption.month = "numeric"; break;
    case "MM":
      formatOption.month = "2-digit"; break;
    case "MMM":
      formatOption.month = "short"; break;
    case "MMMM":
      formatOption.month = "long"; break;
    case "Y":
      formatOption.year = "numeric"; break;
    case "YY":
      formatOption.year = "2-digit"; break;
    case "YYYY":
      formatOption.year = "numeric"; break;
    case "ddd":
    case "DDD":
      formatOption.weekday = "short"; break;
    case "dddd":
    case "DDDD":
      formatOption.weekday = "long"; break;
    default:
      return format;
  }
  return Intl.DateTimeFormat(locale, formatOption).format(date);
}

// setdate sets the date. Accepts 8 character string in ddmmyyyy
function setDate(date) {
  var result;
  if (date && date.length === 8 && !isNaN(date)) {
    var day = parseInt(date.slice(0, 2));
    var month = parseInt(date.slice(2, 4)) - 1;
    var year = parseInt(date.slice(4, 8));

    if (month >= 0 && month <= 11 && day > 0 && day <= 31) {

      //UTC
      result = new Date(Date.UTC(year, month, day));

      //if date is more than number of days in month, the month is incremented.
      if (result.getUTCMonth() !== month || result.getUTCFullYear() !== year) {
        result = undefined;
      }
    }
  }

  //return dateObject .
  return result;
}

// This function will return an array of values which can be interpreted as values of day,month and year for a given date.
function split(date, separator) {
  var dateArray = [];
  dateArray = date.split(separator);

  //if year is in beginning
  if (dateArray[0].length === 4 && dateArray[2].length !== 4) {
    dateArray[1] = dateArray[1] && dateArray[1].length === 1 ? '0' + dateArray[1] : dateArray[1];
    dateArray[2] = dateArray[2] && dateArray[2].length === 1 ? '0' + dateArray[2] : dateArray[2];
    var temp = dateArray[0];
    dateArray[0] = dateArray[2];
    dateArray[2] = temp;
  } else {
    dateArray[0] = dateArray[0] && dateArray[0].length === 1 ? '0' + dateArray[0] : dateArray[0];
    dateArray[1] = dateArray[1] && dateArray[1].length === 1 ? '0' + dateArray[1] : dateArray[1];

    // if year is of length 2 then add a prefix of 19 if greater than 70 and add 20 if less than 70.
    dateArray[2] = (dateArray[2] && dateArray[2].length === 2) ? (parseInt(dateArray[2]) >= 70 ? '19' + dateArray[2] : '20' + dateArray[2]) : dateArray[2];
  }
  return dateArray;
}
