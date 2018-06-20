export default class ElAssist {
  constructor(el) {
    if(!el || !(el instanceof HTMLInputElement) || !(el.getAttribute('type')=='text' || !el.getAttribute('type'))) {
      throw Error('ELInput instance must be handeled with <input type="text"> element!');
    }
    this.textInput = el;
    this.isActive = false;
    this.query = [];
    this.itemIndex = 0;
    this.items = document.createElement('div');
    this.items.className = 'ela_helper';
    this.comment = document.createElement('div');
    this.comment.className = 'ela_comment';

    this.textInput.addEventListener('keydown', e => this.keydown(e));
    this.textInput.addEventListener('keypress', e => this.keypress(e));
    this.textInput.addEventListener('keyup', e => this.keyup(e));
    this.textInput.addEventListener('click', e => this.queryItem(e));
  }

  // setting
  setExternalVars(ext) { elaLogic.setVars(ext); }
  enable() { this.disabled = false; }
  disable() { this.disabled = true; }
  
  // item handling
  showItems() {
    if(this.disabled) return;
    if(!this.textInput.parentElement) return;
    this.textInput.parentElement.insertBefore(this.items, this.textInput.nextSibling);
    this.isActive = true;
    this.focusItem(this.itemIndex);
  }
  hideItems() {
    this.isActive = false;
    this.items.parentElement && this.items.parentElement.removeChild(this.items);
    this.itemIndex = 0;
  }
  focusItem(n) {
    this.itemIndex = n|0;
    this.itemIndex += this.query.length;
    this.itemIndex %= this.query.length;

    [ ...this.items.childNodes ].forEach((v, i) => {
      if(this.itemIndex==i) {
        v.classList.add('ela_focused');
      } else {
        v.classList.remove('ela_focused');
      }
    });
  }
  prevItem() { this.focusItem(--this.itemIndex); }
  nextItem() { this.focusItem(++this.itemIndex); }
  selectItem() { this.replace(elaLogic.current.replace(/_/g, ':'), this.query[this.itemIndex]); }
  queryItem() {
    const pos = this.getCaretPosition();
    if(pos.start==pos.end) {
      this.query = elaLogic.query(this.textInput.value, pos.end);
      this.setItems(this.query);
      this.query.length? this.showItems() : this.hideItems();
    } else {
      this.hideItems();
    }
  }

  // dom handling
  setItems(list) { 
    this.items.innerHTML = '';
    list.forEach((v, i) => {
      const item = document.createElement('div');
      item.className = 'ela_item';
      item.setAttribute('data-keyword', v);
      item.setAttribute('data-index', i);
      item.innerHTML = this.buildItem(v);
      item.addEventListener('click', e => this.click(e));

      this.items.appendChild(item);
    });
  }
  buildItem(keyword) {
    if(EL_FUNCTIONS[keyword]) {
      const details = EL_FUNCTIONS[keyword],
            returnType = details._ret_? '<span class="ela_type">' + details._ret_ + '</span> ' : '',
            args = Object.keys(details).filter(v => v!='_ret_' && v!='_desc_')
                                       .map(v => `<span class="ela_type">${details[v]}</span> <span class="ela_param">${v}</span>`)
                                       .join(', ');

      return `${returnType}<span class="ela_keyword">${keyword}</span>(${args})`;
    } else {
      return `<span class="ela_keyword">${keyword}</span>`;
    }
  }

  // textrange handling
  getCaretPosition() {
    if(document.selection) {
      this.textInput.focus();
      const range = document.selection.createRange(),
            len = range.text.length;
      range.moveStart('character', -this.textInput.value.length);
      return { start: range.text.length - len, end: range.text.length };
    } else if(typeof this.textInput.selectionStart!=='undefined') {
      return { start: this.textInput.selectionStart, end: this.textInput.selectionEnd };
    } else {
      return { start: 0, end: 0 };
    }
  }
  setCaretPosition(start, end) {
    if(typeof start=='object') ({ end, start } = start);
    !end && (end = start);

    if(typeof this.textInput.selectionStart!='undefined') {
      this.textInput.focus();
      this.textInput.selectionStart = start,
      this.textInput.selectionEnd = end;
    } else if(this.textInput.getSelectionRange) {
      this.textInput.focus();
      this.textInput.setSelectionRange(start, end);
    } else if(this.textInput.createTextRange) {
      const range = this.textInput.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  }
  replace(key, text) {
    let pos = this.getCaretPosition();
    const isFn = elaLogic.functions.indexOf(text)>=0,
          getText = () => this.textInput.value.substring(pos.start, pos.end);

    while(key.indexOf(getText())!=-1 && pos.start>=0) pos.start--;
    pos.start++;
    while(getText()!=key) pos.end++;

    this.setCaretPosition(pos.start, pos.end);
    
    if(isFn) {
      document.execCommand('insertText', false, text + '()');
      pos = this.getCaretPosition();
      this.setCaretPosition(pos.start-1, pos.end-1);
    } else {
      document.execCommand('insertText', false, text + (elaLogic.tail()==1? '' : ' '));
    }
    
    this.hideItems();
  }
  addChar(c) {
    const pos = this.getCaretPosition();
    document.execCommand('insertText', false, c);
    this.setCaretPosition(pos);
  }
  moveRight() {
    this.setCaretPosition(++this.getCaretPosition().start);
  }
  leftChar() {
    const start = this.getCaretPosition().start;
    return this.textInput.value.substring(start-1, start);
  }
  rightChar() {
    const end = this.getCaretPosition().end;
    return this.textInput.value.substring(end, end+1);
  }
  
  // event handlers
  keydown(e) {
    const pair = { '(': ')', '[': ']', '\'': '\'', '"': '"' };

    switch(e.key) {
      case 'ArrowUp':
        this.isActive && e.preventDefault();
        this.prevItem();
        break;
      case 'ArrowDown':
        this.isActive && e.preventDefault();
        this.nextItem();
        break;
      case 'Backspace':
        if(this.rightChar() == pair[this.leftChar()]) {
          e.preventDefault();
          const pos = this.getCaretPosition();
          this.setCaretPosition(pos.start-1, pos.end+1);
          document.execCommand('insertText', false, '');
        }
        break;
      case 'Enter':
        this.isActive && this.selectItem();
        break;

      case '(': case '[':
        elaLogic.quoted || this.addChar(pair[e.key]);
        break;
      case ')': case ']':
        this.rightChar()==e.key && !elaLogic.quoted && (e.preventDefault() || this.moveRight(e));
        break;
      case '\'':
        this.rightChar()==e.key && elaLogic.singleQuoted && (e.preventDefault() || this.moveRight());
        elaLogic.quoted || this.addChar(pair[e.key]);
        break;
      case '"':
        this.rightChar()==e.key && elaLogic.doubleQuoted && (e.preventDefault() || this.moveRight());
        elaLogic.quoted || this.addChar(pair[e.key]);
        break;
    }

    setTimeout(this.queryItem.bind(this), 17);
  }
  keypress() {}
  keyup() {}
  click(e) {
    const target = e.path.find(v => v.classList && v.classList.contains('ela_item'));
    if(!target) return;

    this.itemSelected = true;

    this.focusItem(target.getAttribute('data-index'));
    this.selectItem();

    setTimeout(() => this.itemSelected = false, 333);
  }
}

const EL_SYMBOLS = [ '+', '-', '*', '/', '!', '&&', '||', '==', '>=', '>', '<=', '<', '!=', '?', ':'/*, '(', ')'*/ ],
      EL_OPERATORS = [ 'div', 'mod', 'empty', 'eq', 'ge', 'gt', 'le', 'lt', 'ne' ],
      EL_CONSTANTS = [
        'RECORDS', 'REDUCE_OUT', 'MAP_OUT', 'REDUCE_IN', 'MAP_IN', 'GROUPS',
        'KB', 'MB', 'GB', 'TB', 'PB',
        'MINUTES', 'HOURS', 'DAYS', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR',
      ],

      INT = 'int',
      LONG = 'long',
      BOOLEAN = 'boolean',
      STRING = 'String',
      MAP = 'Map',

      EL_FUNCTIONS = {
        firstNotNull: { value1: STRING, value2: STRING, _ret_: STRING, _desc_: 'It returns the first not <pre>null</pre> value, or <pre>null</pre> if both are <pre>null</pre> . <br/> Note that if the output of this function is <pre>null</pre> and it is used as string, the EL library converts it to an empty string. This is the common behavior when using <pre>firstNotNull()</pre> in node configuration sections.' },
        concat: { s1: STRING, s2: STRING, _ret_: STRING, _desc_: 'It returns the concatenation of 2 strings. A string with <pre>null</pre> value is considered as an empty string.' },
        replaceAll: { src: STRING, regex: STRING, replacement: STRING, _ret_: STRING, _desc_: 'Replace each occurrence of regular expression match in the first string with the replacement string and return the replaced string. A \'regex\' string with <pre>null</pre> value is considered as no change. A \'replacement\' string with <pre>null</pre> value is consider as an empty string.' },
        appendAll: { src: STRING, append: STRING, delimeter: STRING, _ret_: STRING, _desc_: 'Add the append string into each splitted sub-strings of the first string(<pre>src</pre>). The split is performed into <pre>src</pre> string using the <pre>delimiter</pre> .<br/> E.g. <pre>appendAll("/a/b/,/c/b/,/c/d/", "ADD", ",")</pre> will return <pre>/a/b/ADD,/c/b/ADD,/c/d/ADD</pre> . A <pre>append</pre> string with <pre>null</pre> value is consider as an empty string. A <pre>delimiter</pre> string with value <pre>null</pre> is considered as no append in the string.' },
        trim: { s: STRING, _ret_: STRING, _desc_: 'It returns the trimmed value of the given string. A string with <pre>null</pre> value is considered as an empty string.' },
        urlEncode: { s: STRING, _ret_: STRING, _desc_: 'It returns the URL UTF-8 encoded value of the given string. A string with <pre>null</pre> value is considered as an empty string.' },
        timestamp: { _ret_: STRING, _desc_: 'It returns the current datetime in ISO8601 format, down to minutes (yyyy-MM-ddTHH:mmZ), in the Oozie\'s processing timezone, i.e. 1997-07-16T19:20Z' },
        toJsonStr: { m: MAP, _ret_: STRING, _desc_: 'It returns an XML encoded JSON representation of a Map. This function is useful to encode as a single property the complete action-data of an action, <b>wf:actionData(String actionName)</b> , in order to pass it in full to another action.' },
        toPropertiesStr: { m: MAP, _ret_: STRING, _desc_: 'It returns an XML encoded Properties representation of a Map. This function is useful to encode as a single property the complete action-data of an action, <b>wf:actionData(String actionName)</b> , in order to pass it in full to another action.' },
        toConfigurationStr: { m: MAP, _ret_: STRING, _desc_: 'It returns an XML encoded Configuration representation of a Map. This function is useful to encode as a single property the complete action-data of an action, <b>wf:actionData(String actionName)</b> , in order to pass it in full to another action.' },

        'wf:id': { _ret_: STRING, _desc_: 'It returns the workflow job ID for the current workflow job.' },
        'wf:name': { _ret_: STRING, _desc_: 'It returns the workflow application name for the current workflow job.' },
        'wf:appPath': { _ret_: STRING, _desc_: 'It returns the workflow application path for the current workflow job.' },
        'wf:conf': { name: STRING, _ret_: STRING, _desc_: 'It returns the value of the workflow job configuration property for the current workflow job, or an empty string if undefined.' },
        'wf:user': { _ret_: STRING, _desc_: 'It returns the user name that started the current workflow job.' },
        'wf:group': { _ret_: STRING, _desc_: 'It returns the group/ACL for the current workflow job.' },
        'wf:callback': { stateVar: STRING, _ret_: STRING, _desc_: 'It returns the callback URL for the current workflow action node, <pre>stateVar</pre> can be a valid exit state (<pre>OK</pre> or <pre>ERROR</pre> ) for the action or a token to be replaced with the exit state by the remote system executing the task.' },
        'wf:transition': { node: STRING, _ret_: STRING, _desc_: 'It returns the transition taken by the specified workflow action node, or an empty string if the action has not being executed or it has not completed yet.' },
        'wf:lastErrorNode': { _ret_: STRING, _desc_: 'It returns the name of the last workflow action node that exit with an <pre>ERROR</pre<> exit state, or an empty string if no action has exited with <pre>ERROR</pre> state in the current workflow job.' },
        'wf:errorCode': { node: STRING, _ret_: STRING, _desc_: 'It returns the error code for the specified action node, or an empty string if the action node has not exited with <pre>ERROR</pre> state.<br/>Each type of action node must define its complete error code list.' },
        'wf:errorMessage': { message: STRING, _ret_: STRING, _desc_: 'It returns the error message for the specified action node, or an empty string if no action node has not exited with <pre>ERROR</pre> state.<br/>The error message can be useful for debugging and notification purposes.' },
        'wf:run': { _ret_: INT, _desc_: 'It returns the run number for the current workflow job, normally <pre>0</pre> unless the workflow job is re-run, in which case indicates the current run.' },
        'wf:actionData': { node: STRING, _ret_: MAP, _desc_: 'This function is only applicable to action nodes that produce output data on completion.<br/>The output data is in a Java Properties format and via this EL function it is available as a <pre>Map</pre>.' },
        'wf:actionExternalId': { node: STRING, _ret_: STRING, _desc_: 'It returns the external Id for an action node, or an empty string if the action has not being executed or it has not completed yet.' },
        'wf:actionTrackerUri': { node: STRING, _ret_: STRING, _desc_: 'It returns the tracker URI for an action node, or an empty string if the action has not being executed or it has not completed yet.' },
        'wf:actionExternalStatus': { node: STRING, _ret_: STRING, _desc_: 'It returns the external status for an action node, or an empty string if the action has not being executed or it has not completed yet.' },

        'fs:exists': { path: STRING, _ret_: BOOLEAN, _desc_: 'It returns <pre>true</pre> or <pre>false</pre> depending if the specified path URI exists or not. If a glob pattern is used for the URI, it returns true when there is at least one matching path.' },
        'fs:isDir': { path: STRING, _ret_: BOOLEAN, _desc_: 'It returns <pre>true</pre> if the specified path URI exists and it is a directory, otherwise it returns <pre>false</pre> .' },
        'fs:dirSize': { path: STRING, _ret_: LONG, _desc_: 'It returns the size in bytes of all the files in the specified path. If the path is not a directory, or if it does not exist it returns -1. It does not work recursively, only computes the size of the files under the specified path.' },
        'fs:fileSize': { path: STRING, _ret_: LONG, _desc_: 'It returns the size in bytes of specified file. If the path is not a file, or if it does not exist it returns -1.' },
        'fs:blockSize': { path: STRING, _ret_: LONG, _desc_: 'It returns the block size in bytes of specified file. If the path is not a file, or if it does not exist it returns -1.' },

        'hadoop:counters': { node: STRING, _ret_: MAP },
        'hadoop:conf': { port: STRING, prop: STRING, _ret_: STRING },

        'hcat:exists': { uri: STRING, _ret_: BOOLEAN, _desc_: 'It returns <pre>true</pre> or <pre>false</pre> based on if the partitions in the table exists or not.' },

        'coord:days': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'day\' unit.<br/><pre>val</pre> should be greater than <pre>0</pre>.<br/>It returns number of days and also set the frequency timeunit to "day"' },
        'coord:months': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'month\' unit.<br/><pre>val</pre> should be greater than <pre>0</pre>.It returns number of months and also set the frequency timeunit to "month"' },
        'coord:hours': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'minute\' unit.<br/><pre>val</pre> should be greater than <pre>0</pre>.It returns number of minutes and also set the frequency timeunit to "minute"' },
        'coord:minutes': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'minute\' unit.<br/><pre>val</pre> should be greater than <pre>0</pre>.It returns number of minutes and also set the frequency timeunit to "minute"' },
        'coord:endOfDays': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'day\' unit and specify the "end of day" property.<br/>Every instance will start at 00:00 hour of each day.<br/><pre>val</pre> should be greater than <pre>0</pre>.<br/>It returns number of dyas and also set the frequency timeunit to "day" and end_of_duration flag to "day"' },
        'coord:endOfMonths': { val: INT, _ret_: INT, _desc_: 'Used in defining the frequency in \'month\' unit and sepcify the "end of month" property.<br/>Every instance will start at first day of each month at 00:00 hour.<br/><pre>val</pre> should be breater than <pre>0</pre>.<br/>It returns number of months and also set the frequency timeunit to "month" and end_of_duration flag to "month"' },
        'coord:tzOffset': { _ret_: INT, _desc_: 'Calculate the difference of timezone offset in minutes between dataset and coordinator job.<br/>It depends on both \'Timezone of both dataset and job\' and \'Action creation Time\'.<br/> It returns the difference in minutes(DataSet TZ Offset - Application TZ offset).' },
        'coord:dateOffset': { strBaseDate: STRING, offset: INT, unit: STRING, _ret_: STRING, _desc_: 'Returns a date string that is offset from <pre>strBaseDate</pre> by the amount specified. The unit can be one of <pre>DAY</pre>, <pre>MONTH</pre>, <pre>HOUR</pre>, <pre>MINUTE</pre>, <pre>MONTH</pre>.' },
        'coord:dateTzOffset': { strBaseDate: STRING, timezone: STRING, _ret_: STRING, _desc_: 'Returns a date string that is offset from <pre>strBaseDate</pre> by the differencd from Oozie processing timezone to the given timezone. It will account for daylight saving time based on the given <pre>strBaseDate</pre> and <pre>timezone</pre>.' },
        'coord:future': { n: INT, instance: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of <pre>n</pre>-th future available dataset instance from nomial Time but not beyond the instance specified as <pre>instance</pre>.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit(day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li><li>Existence of dataset\'s directory</li></ol>' },
        'coord:futureRange': { start: INT, end: INT, instance: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of the future available dataset instances from <pre>start</pre> to <pre>end</pre> offsets from nomial Time but not beyond the instance specified as <pre>instance</pre>.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit(day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li><li>Existence of dataset\'s directory</li></ol>' },
        'coord:nomalTime': { _ret_: STRING, _desc_: 'Return nomial time or Action Creation Time.' },
        'coord:formatTime': { dateTimeStr: STRING, format: STRING, _ret_: STRING, _desc_: 'Convert from standard date-time formatting to a desired format.' },
        'coord:epochTime': { dateTimeStr: STRING, millis: STRING, _ret_: STRING, _desc_: 'Convert from standard date-time formatting to a Unix epoch time.' },
        'coord:actionId': { _ret_: STRING, _desc_: 'Return Action Id.' },
        'coord:name': { _ret_: STRING, _desc_: 'Return Job Name.' },
        'coord:actualTime': { _ret_: STRING, _desc_: 'Return Action Start time.' },
        'coord:dataIn': { dataInName: STRING, _ret_: STRING, _desc_: 'Used to specify a list of URIs that are used as input dir to the workflow job.<br/>Look for two evaluator-level variables.<br/>Look for two evaluator-level variables<br/>A) <pre>.datain.&lt;DATAIN_NAME&gt;</pre> B) <pre>.datain.&lt;DATAIN_NAME&gt;.unresolved</pre><br/>A defines the current list of URI.<br/>B defines whether there are any unresolved EL-function (i.e latest)<br/>If there are something unresolved, this function will echo back the original function.<br/>otherwise it sends the uris.' },
        'coord:dataOut': { dataOutName: STRING, _ret_: STRING, _desc_: 'Used to specify a list of URIs that are output dir of the workflow job.<br/>Look for one evaluator-level variable<br/><pre>dataout.&lt;DATAOUT_NAME&gt;</pre><br/>It defines the current list of URI.<br/>otherwise it sends the uris.' },
        'coord:current': { n: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of <pre>n</pre>-th dataset instance.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li></ol>' },
        'coord:currentRange': { start: INT, end: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of current dataset instances from <pre>start</pre> to <pre>end</pre> offsets from the nominal time.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li></ol>' },
        'coord:offset': { n: INT, timeUnit: STRING, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of the given offset from the dataset effective nominal time.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time Unit</li><li>Data set Time zone/DST</li><li>Data set initial instance</li><li>Action Creation Time</li></ol>' },
        'coord:hoursInDay': { n: INT, _ret_: INT, _desc_: 'Determine how many hours is on the date of <pre>n</pre>-th dataset instance.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li></ol>' },
        'coord:daysInMonth': { n: INT, _ret_: INT, _desc_: 'Calculate number of days in one month for <pre>n</pre>-th dataset instance.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li></ol>' },
        'coord:latest': { n: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of <pre>n</pre>-th latest available dataset instance.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li><li>Existence of dataset\'s directory</li></ol>' },
        'coord:latestRange': { start: INT, end: INT, _ret_: STRING, _desc_: 'Determine the date-time in Oozie processing timezone of latest available dataset instances from <pre>start</pre> to <pre>end</pre> offsets from the nominal time.<br/>It depends on:<ol><li>Data set frequency</li><li>Data set Time unit (day, month, minute)</li><li>Data set Time zone/DST</li><li>End Day/Month flag</li><li>Data set initial instance</li><li>Action Creation Time</li><li>Existence of dataset\'s directory</li></ol>' },
        'coord:conf': { property: STRING, _ret_: STRING, _desc_: 'Return a job configuration property for the coordinator.' },
        'coord:user': { _ret_: STRING, _desc_: 'Return the user that submitted the coordinator job.' },

        // 'coord:endOfWeeks': {},
        // 'coord:absolute': {},
        // 'coord:nomial': {},
        // 'coord:databaseIn': {},
        // 'coord:databaseOut': {},
        // 'coord:tableIn': {},
        // 'coord:tableOut': {},
        // 'coord:dataInPartitionFilter': {},
        // 'coord:dataInPartitionMin': {},
        // 'coord:dataInPartitionMax': {},
        // 'coord:dataInPartitions': {},
        // 'coord:dataOutPartitions': {},
        // 'coord:dataOutPartitionValue': {}
      };

const elaLogic = {
  query: function(string, index) {
    this.succeeded = string.substring(index, index+1);
    string = string.substring(0, index);

    if(this.checkQuotes(string)) return []; // in string
    if(!this.tail()) return [];             // middle of word

    string = string.replace(/(wf|fs|hcat|coord):/g, '$1_');                                                 // replace functionnames with namespace
    string = string.replace(/(\+|\-|\*|\/|\!|\&\&|\|\||==|>|>=|<|<=|\!=|\?|:|\(|\)|\[|\]|\'|\")/g, ' $1 '); // emboss
    const tokens = string.split(/\s+/);                                                                       // tokenize
    this.current = tokens.pop();                                                                            // get last word

    if(this.current == '') return [];

    this.precedent = tokens.pop();

    switch(true) {
      case this.operators.indexOf(this.precedent)>=0:       // operators
      case this.precedent === undefined:                    // no precedent
      case /\(|\[/.test(this.precedent):                    // opening brackets
        return this.suggest(this.current, this.values);     // non-ops should be followed,
      
      case this.values.indexOf(this.precedent)>=0:          // reserved words or variables
      case /^[0-9]*\.?[0-9]+$/.test(this.precedent):        // numeric
      case /\'|\"/.test(this.precedent):                    // quotation
      case /\)|\]/.test(this.precedent):                    // closing brackets
        return this.suggest(this.current, this.operators);  // ops should be followed

      default:
        return this.suggest(this.current, this.all);
    }
  },

  suggest: function(key, list) {
    let em = false;
    const k = key.toLowerCase(),
          candidate = list.filter(v => {
            const w = v.replace(':', '_').toLowerCase();
            if(w==k) em = true;
            return w.indexOf(k)==0 || v.indexOf(':' + k)>=0;
          });
    return em? [] : candidate;
  },
  
  setVars: function(ext = []) {
    this.values = this.nonOps.concat(ext);
    this.all = this.values.concat(this.operators);
  },

  checkQuotes: function(str) {
    let status = 'NORMAL';
    const tMap = {
      'NORMAL': { '\'': 'SINGLE', '"': 'DOUBLE' },
      'SINGLE': { '\\': 'SINGLE_ESCAPE', '\'': 'NORMAL' },
      'DOUBLE': { '\\': 'DOUBLE_ESCAPE', '"': 'NORMAL' },
      'SINGLE_ESCAPE': { default: 'SINGLE' },
      'DOUBLE_ESCAPE': { default: 'DOUBLE' }
    };
    
    str.split('').forEach(function(v) { status = tMap[status][v] || tMap[status].default || status; });
    this.singleQuoted = status=='SINGLE' || status=='SINGLE_ESCAPE';
    this.doubleQuoted = status=='DOUBLE' || status=='DOUBLE_ESCAPE';
    return this.quoted = status!='NORMAL';
  },

  tail: function() { return !this.succeeded? -1 : /[a-zA-Z0-9_/$]/.test(this.succeeded)? 0 : 1; }
};
      
elaLogic.operators = EL_SYMBOLS.concat(EL_OPERATORS);
elaLogic.functions = Object.keys(EL_FUNCTIONS);
elaLogic.nonOps = EL_CONSTANTS.concat(elaLogic.functions);
elaLogic.setVars();

window.ElAssist = ElAssist;