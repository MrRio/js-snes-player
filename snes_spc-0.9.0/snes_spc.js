// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      // Module is the only 'upvar', which we provide directly. We also provide FS for legacy support.
      var evalled = eval('(function(Module, FS) { return function(' + args.join(',') + '){ ' + source + ' } })')(Module, typeof FS !== 'undefined' ? FS : null);
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          (((codePoint - 0x10000) / 0x400)|0) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        ret = Runtime.stackAlloc(str.length + 1); // +1 for the trailing '\0'
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    var func = getCFunc(ident);
    var cArgs = [];
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;


function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;


function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;


function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;


function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var final = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    final = parse();
  } catch(e) {
    final += '?';
  }
  if (final.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return final;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module['stackTrace'] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(3451);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([40,117,110,115,105,103,110,101,100,41,32,97,100,100,114,32,60,32,114,101,103,105,115,116,101,114,95,99,111,117,110,116,0,0,0,0,0,0,0,0,46,47,83,80,67,95,68,83,80,46,104,0,0,0,0,0,119,114,105,116,101,0,0,0,114,101,97,100,0,0,0,0,255,0,245,246,241,245,254,254,4,3,14,14,26,26,14,22,2,3,0,1,244,0,1,1,7,6,14,14,27,14,14,23,5,6,3,4,255,3,4,4,10,9,14,14,26,251,14,23,8,9,6,7,2,6,7,7,13,12,14,14,27,252,14,24,11,12,9,10,5,9,10,10,16,15,14,14,254,252,14,24,14,15,12,13,8,12,13,13,19,18,14,14,254,220,14,24,17,18,15,16,11,15,16,16,22,21,14,14,28,253,14,25,20,21,18,19,14,18,19,19,25,24,14,14,14,29,14,25,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,82,65,77,32,91,105,32,43,32,114,111,109,95,97,100,100,114,93,32,61,61,32,40,117,105,110,116,56,95,116,41,32,100,97,116,97,0,0,0,0,83,78,69,83,95,83,80,67,46,99,112,112,0,0,0,0,99,112,117,95,119,114,105,116,101,95,104,105,103,104,0,0,114,101,103,32,43,32,40,114,95,116,48,111,117,116,32,43,32,48,120,70,48,32,45,32,48,120,49,48,48,48,48,41,32,60,32,48,120,49,48,48,0,0,0,0,0,0,0,0,99,112,117,95,114,101,97,100,0,0,0,0,0,0,0,0,45,99,112,117,95,108,97,103,95,109,97,120,32,60,61,32,109,46,115,112,99,95,116,105,109,101,32,38,38,32,109,46,115,112,99,95,116,105,109,101,32,60,61,32,48,0,0,0,101,110,100,95,102,114,97,109,101,0,0,0,0,0,0,0,114,101,108,95,116,105,109,101,32,60,61,32,48,0,0,0,46,47,83,80,67,95,67,80,85,46,104,0,0,0,0,0,114,117,110,95,117,110,116,105,108,95,0,0,0,0,0,0,83,80,67,32,101,109,117,108,97,116,105,111,110,32,101,114,114,111,114,0,0,0,0,0,48,0,0,0,0,0,0,0,109,46,115,112,99,95,116,105,109,101,32,60,61,32,101,110,100,95,116,105,109,101,0,0,40,71,52,54,38,84,84,104,72,71,69,86,85,101,34,70,40,71,52,54,38,84,84,116,72,71,69,86,85,101,34,56,40,71,52,54,38,68,84,102,72,71,69,86,85,69,34,67,40,71,52,54,38,68,84,117,72,71,69,86,85,85,34,54,40,71,52,54,38,84,82,69,72,71,69,86,85,85,34,197,56,71,52,54,38,68,82,68,72,71,69,86,85,85,34,52,56,71,69,71,37,100,82,73,72,71,86,103,69,85,34,131,40,71,52,54,36,83,67,64,72,71,69,86,52,84,34,96,83,78,69,83,45,83,80,67,55,48,48,32,83,111,117,110,100,32,70,105,108,101,32,68,97,116,97,32,118,48,46,51,48,26,26,0,0,0,0,0,78,111,116,32,97,110,32,83,80,67,32,102,105,108,101,0,67,111,114,114,117,112,116,32,83,80,67,32,102,105,108,101,0,0,0,0,0,0,0,0,40,115,105,122,101,32,38,32,49,41,32,61,61,32,48,0,83,78,69,83,95,83,80,67,95,109,105,115,99,46,99,112,112,0,0,0,0,0,0,0,115,101,116,95,111,117,116,112,117,116,0,0,0,0,0,0,111,117,116,32,60,61,32,111,117,116,95,101,110,100,0,0,111,117,116,32,60,61,32,38,109,46,101,120,116,114,97,95,98,117,102,32,91,101,120,116,114,97,95,115,105,122,101,93,0,0,0,0,0,0,0,0,115,97,118,101,95,101,120,116,114,97,0,0,0,0,0,0,40,99,111,117,110,116,32,38,32,49,41,32,61,61,32,48,0,0,0,0,0,0,0,0,112,108,97,121,0,0,0,0,40,115,105,122,101,32,38,32,49,41,32,61,61,32,48,0,83,80,67,95,68,83,80,46,99,112,112,0,0,0,0,0,115,101,116,95,111,117,116,112,117,116,0,0,0,0,0,0,7,0,0,0,255,15,0,0,255,15,0,0,255,7,0,0,255,7,0,0,255,7,0,0,255,3,0,0,255,3,0,0,255,3,0,0,255,1,0,0,255,1,0,0,255,1,0,0,255,0,0,0,255,0,0,0,255,0,0,0,127,0,0,0,127,0,0,0,127,0,0,0,63,0,0,0,63,0,0,0,63,0,0,0,31,0,0,0,31,0,0,0,31,0,0,0,15,0,0,0,15,0,0,0,15,0,0,0,7,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,114,1,25,5,110,1,25,5,106,1,24,5,102,1,24,5,98,1,24,5,95,1,24,5,91,1,24,5,87,1,23,5,83,1,23,5,80,1,23,5,76,1,22,5,72,1,22,5,69,1,21,5,65,1,20,5,62,1,20,5,58,1,19,5,55,1,18,5,51,1,17,5,48,1,17,5,44,1,16,5,41,1,15,5,37,1,14,5,34,1,13,5,30,1,12,5,27,1,11,5,24,1,10,5,20,1,8,5,17,1,7,5,14,1,6,5,11,1,4,5,7,1,3,5,4,1,2,5,1,1,0,5,254,0,255,4,251,0,253,4,248,0,251,4,245,0,250,4,242,0,248,4,239,0,246,4,236,0,245,4,233,0,243,4,230,0,241,4,227,0,239,4,224,0,237,4,221,0,235,4,218,0,233,4,215,0,231,4,212,0,229,4,210,0,227,4,207,0,224,4,204,0,222,4,201,0,220,4,199,0,217,4,196,0,215,4,193,0,213,4,191,0,210,4,188,0,208,4,186,0,205,4,183,0,203,4,180,0,200,4,178,0,197,4,175,0,195,4,173,0,192,4,171,0,189,4,168,0,186,4,166,0,183,4,163,0,181,4,161,0,178,4,159,0,175,4,156,0,172,4,154,0,169,4,152,0,166,4,150,0,162,4,147,0,159,4,145,0,156,4,143,0,153,4,141,0,150,4,139,0,146,4,137,0,143,4,134,0,140,4,132,0,136,4,130,0,133,4,128,0,129,4,126,0,126,4,124,0,122,4,122,0,119,4,120,0,115,4,118,0,112,4,117,0,108,4,115,0,104,4,113,0,101,4,111,0,97,4,109,0,93,4,107,0,89,4,106,0,85,4,104,0,82,4,102,0,78,4,100,0,74,4,99,0,70,4,97,0,66,4,95,0,62,4,94,0,58,4,92,0,54,4,90,0,50,4,89,0,46,4,87,0,42,4,86,0,37,4,84,0,33,4,83,0,29,4,81,0,25,4,80,0,21,4,78,0,16,4,77,0,12,4,76,0,8,4,74,0,3,4,73,0,255,3,71,0,251,3,70,0,246,3,69,0,242,3,67,0,237,3,66,0,233,3,65,0,229,3,64,0,224,3,62,0,220,3,61,0,215,3,60,0,210,3,59,0,206,3,58,0,201,3,56,0,197,3,55,0,192,3,54,0,187,3,53,0,183,3,52,0,178,3,51,0,173,3,50,0,169,3,49,0,164,3,48,0,159,3,47,0,155,3,46,0,150,3,45,0,145,3,44,0,140,3,43,0,136,3,42,0,131,3,41,0,126,3,40,0,121,3,39,0,116,3,38,0,112,3,37,0,107,3,36,0,102,3,36,0,97,3,35,0,92,3,34,0,87,3,33,0,83,3,32,0,78,3,32,0,73,3,31,0,68,3,30,0,63,3,29,0,58,3,29,0,53,3,28,0,48,3,27,0,43,3,27,0,38,3,26,0,34,3,25,0,29,3,24,0,24,3,24,0,19,3,23,0,14,3,23,0,9,3,22,0,4,3,21,0,255,2,21,0,250,2,20,0,245,2,20,0,240,2,19,0,235,2,19,0,230,2,18,0,225,2,17,0,220,2,17,0,216,2,16,0,211,2,16,0,206,2,15,0,201,2,15,0,196,2,15,0,191,2,14,0,186,2,14,0,181,2,13,0,176,2,13,0,171,2,12,0,166,2,12,0,162,2,11,0,157,2,11,0,152,2,11,0,147,2,10,0,142,2,10,0,137,2,10,0,132,2,9,0,128,2,9,0,123,2,9,0,118,2,8,0,113,2,8,0,108,2,8,0,103,2,7,0,99,2,7,0,94,2,7,0,89,2,6,0,84,2,6,0,80,2,6,0,75,2,6,0,70,2,5,0,65,2,5,0,61,2,5,0,56,2,5,0,51,2,4,0,47,2,4,0,42,2,4,0,38,2,4,0,33,2,4,0,28,2,3,0,24,2,3,0,19,2,3,0,15,2,3,0,10,2,3,0,5,2,2,0,1,2,2,0,252,1,2,0,248,1,2,0,243,1,2,0,239,1,2,0,235,1,2,0,230,1,1,0,226,1,1,0,221,1,1,0,217,1,1,0,213,1,1,0,208,1,1,0,204,1,1,0,200,1,1,0,195,1,1,0,191,1,1,0,187,1,1,0,183,1,0,0,178,1,0,0,174,1,0,0,170,1,0,0,166,1,0,0,162,1,0,0,158,1,0,0,154,1,0,0,149,1,0,0,145,1,0,0,141,1,0,0,137,1,0,0,133,1,0,0,129,1,0,0,125,1,0,0,122,1,0,0,118,1,98,114,114,95,111,102,102,115,101,116,32,61,61,32,98,114,114,95,98,108,111,99,107,95,115,105,122,101,0,0,0,0,114,117,110,0,0,0,0,0,13,12,12,12,12,12,12,12,12,12,12,12,12,16,16,16,0,0,1,2,3,4,5,6,7,8,9,10,11,11,11,11,109,46,114,97,109,0,0,0,115,111,102,116,95,114,101,115,101,116,95,99,111,109,109,111,110,0,0,0,0,0,0,0,69,139,90,154,228,130,27,120,0,0,170,150,137,14,224,128,42,73,61,186,20,160,172,197,0,0,81,187,156,78,123,255,244,253,87,50,55,217,66,34,0,0,91,60,159,27,135,154,111,39,175,123,229,104,10,217,0,0,154,197,156,78,123,255,234,33,120,79,221,237,36,20,0,0,119,177,209,54,193,103,82,87,70,61,89,244,135,164,0,0,126,68,156,78,123,255,117,245,6,151,16,195,36,187,0,0,123,122,224,96,18,15,247,116,28,229,57,61,115,193,0,0,122,179,255,78,123,255,42,40,118,111,108,97,116,105,108,101,32,99,104,97,114,42,41,32,38,105,32,33,61,32,48,0,0,0,0,0,0,0,46,47,98,108,97,114,103,103,95,101,110,100,105,97,110,46,104,0,0,0,0,0,0,0,98,108,97,114,103,103,95,118,101,114,105,102,121,95,98,121,116,101,95,111,114,100,101,114,0,0,0,0,0,0,0,0,40,99,111,117,110,116,32,38,32,49,41,32,61,61,32,48,0,0,0,0,0,0,0,0,83,80,67,95,70,105,108,116,101,114,46,99,112,112,0,0,114,117,110,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,16,11,0,0,16,10,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,56,11,0,0,40,10,0,0,32,10,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,56,11,0,0,96,10,0,0,80,10,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,57,95,95,112,111,105,110,116,101,114,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,112,98,97,115,101,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,56,11,0,0,192,10,0,0,80,10,0,0,0,0,0,0,56,11,0,0,152,10,0,0,232,10,0,0,0,0,0,0,0,0,0,0,136,10,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,128,11,0,0,1,0,0,0,5,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,56,11,0,0,88,11,0,0,136,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy; 
  Module["_memmove"] = _memmove;

   
  Module["_memset"] = _memset;

  function ___errno_location() {
      return ___errno_state;
    }

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          ctx = GL.getContext(contextHandle).GLctx;
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = -event.wheelDelta;
            break;
          case 'wheel': 
            delta = event.deltaY;
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return Math.max(-1, Math.min(1, delta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

   
  Module["_strlen"] = _strlen;

___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


  var Math_min = Math.min;
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

  function asmPrintInt(x, y) {
    Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  function asmPrintFloat(x, y) {
    Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'use asm';
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_iiii=env.invoke_iiii;
  var invoke_vi=env.invoke_vi;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_viiii=env.invoke_viiii;
  var _fflush=env._fflush;
  var _sysconf=env._sysconf;
  var _abort=env._abort;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _time=env._time;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var ___assert_fail=env.___assert_fail;
  var ___errno_location=env.___errno_location;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 7)&-8;

    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }

  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
function __ZNK7SPC_DSP4readEi($this,$addr) {
 $this = $this|0;
 $addr = $addr|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($addr>>>0)<(128);
 if ($0) {
  $1 = (($this) + ($addr)|0);
  $2 = HEAP8[$1>>0]|0;
  $3 = $2&255;
  STACKTOP = sp;return ($3|0);
 } else {
  ___assert_fail((8|0),(48|0),161,(72|0));
  // unreachable;
 }
 return 0|0;
}
function __ZN7SPC_DSP5writeEii($this,$addr,$data) {
 $this = $this|0;
 $addr = $addr|0;
 $data = $data|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($addr>>>0)<(128);
 if (!($0)) {
  ___assert_fail((8|0),(48|0),185,(64|0));
  // unreachable;
 }
 $1 = $data&255;
 $2 = (($this) + ($addr)|0);
 HEAP8[$2>>0] = $1;
 $3 = $addr & 15;
 $4 = ($3>>>0)<(2);
 do {
  if ($4) {
   $5 = $3 ^ $addr;
   __ZN7SPC_DSP16update_voice_volEi($this,$5);
  } else {
   $6 = ($3|0)==(12);
   if ($6) {
    if ((($addr|0) == 76)) {
     $7 = $data & 255;
     $8 = (($this) + 300|0);
     HEAP32[$8>>2] = $7;
     break;
    } else if ((($addr|0) == 124)) {
     $9 = (($this) + 124|0);
     HEAP8[$9>>0] = 0;
     break;
    } else {
     break;
    }
   }
  }
 } while(0);
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP16disable_surroundEb($this,$disable) {
 $this = $this|0;
 $disable = $disable|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $disable ? 0 : -16384;
 $1 = (($this) + 1564|0);
 HEAP32[$1>>2] = $0;
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP16update_voice_volEi($this,$addr) {
 $this = $this|0;
 $addr = $addr|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $l$0 = 0, $r$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + ($addr)|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1 << 24 >> 24;
 $3 = (($addr) + 1)|0;
 $4 = (($this) + ($3)|0);
 $5 = HEAP8[$4>>0]|0;
 $6 = $5 << 24 >> 24;
 $7 = Math_imul($6, $2)|0;
 $8 = (($this) + 1564|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ($7|0)<($9|0);
 if ($10) {
  $11 = $2 >> 7;
  $12 = $11 ^ $2;
  $13 = $6 >> 7;
  $14 = $13 ^ $6;
  $l$0 = $12;$r$0 = $14;
 } else {
  $l$0 = $2;$r$0 = $6;
 }
 $15 = $addr >> 4;
 $16 = ((($this) + (($15*140)|0)|0) + 444|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $17 & $l$0;
 $19 = ((($this) + (($15*140)|0)|0) + 436|0);
 HEAP32[$19>>2] = $18;
 $20 = $17 & $r$0;
 $21 = ((($this) + (($15*140)|0)|0) + 440|0);
 HEAP32[$21>>2] = $20;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC10run_timer_EPNS_5TimerEi($this,$t,$time) {
 $this = $this|0;
 $t = $t|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $divider$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$t>>2]|0;
 $1 = (($time) - ($0))|0;
 $2 = (($t) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($1|0) / ($3|0))&-1;
 $5 = (($4) + 1)|0;
 $6 = Math_imul($5, $3)|0;
 $7 = (($6) + ($0))|0;
 HEAP32[$t>>2] = $7;
 $8 = (($t) + 16|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ($9|0)==(0);
 if ($10) {
  STACKTOP = sp;return ($t|0);
 }
 $11 = (($t) + 8|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = (($t) + 12|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = (($12) + 255)|0;
 $16 = (($15) - ($14))|0;
 $17 = $16 & 255;
 $18 = (($14) + ($5))|0;
 $19 = (($4) - ($17))|0;
 $20 = ($19|0)>(-1);
 if ($20) {
  $21 = (($19|0) / ($12|0))&-1;
  $22 = (($t) + 20|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = (($21) + 1)|0;
  $25 = (($24) + ($23))|0;
  $26 = $25 & 15;
  HEAP32[$22>>2] = $26;
  $27 = HEAP32[$11>>2]|0;
  $28 = Math_imul($27, $21)|0;
  $29 = (($19) - ($28))|0;
  $divider$0 = $29;
 } else {
  $divider$0 = $18;
 }
 $30 = $divider$0 & 255;
 HEAP32[$13>>2] = $30;
 STACKTOP = sp;return ($t|0);
}
function __ZN8SNES_SPC10enable_romEi($this,$enable) {
 $this = $this|0;
 $enable = $enable|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 $0 = (($this) + 2072|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($enable|0);
 if ($2) {
  STACKTOP = sp;return;
 }
 HEAP32[$0>>2] = $enable;
 $3 = ($enable|0)!=(0);
 if ($3) {
  $4 = (($this) + 2140|0);
  $5 = (($this) + 68188|0);
  dest=$4+0|0; src=$5+0|0; stop=dest+64|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 }
 $6 = (($this) + 68188|0);
 $7 = (($this) + 2076|0);
 $8 = (($this) + 2140|0);
 $9 = $3 ? $7 : $8;
 dest=$6+0|0; src=$9+0|0; stop=dest+64|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC8dsp_readEi($this,$time) {
 $this = $this|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1942|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1&255;
 $3 = $2 & 127;
 $4 = ((($this) + ($3)|0) + 1612|0);
 $5 = HEAP8[$4>>0]|0;
 $6 = $5 << 24 >> 24;
 $7 = (($time) - ($6))|0;
 $8 = (($this) + 1996|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = (($7) - ($9))|0;
 $11 = ($10|0)>(-1);
 if ($11) {
  $12 = (($10) + 32)|0;
  $13 = $12 & -32;
  $14 = (($13) + ($9))|0;
  HEAP32[$8>>2] = $14;
  __ZN7SPC_DSP3runEi($this,$13);
 }
 $15 = HEAP8[$0>>0]|0;
 $16 = $15&255;
 $17 = $16 & 127;
 $18 = (__ZNK7SPC_DSP4readEi($this,$17)|0);
 STACKTOP = sp;return ($18|0);
}
function __ZN8SNES_SPC18cpu_write_smp_reg_Eiii($this,$data,$time,$addr) {
 $this = $this|0;
 $data = $data|0;
 $time = $time|0;
 $addr = $addr|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 switch ($addr|0) {
 case 12: case 11: case 10:  {
  $0 = (($addr) + -10)|0;
  $1 = (($data) + 255)|0;
  $2 = $1 & 255;
  $3 = (($2) + 1)|0;
  $4 = ((($this) + (($0*24)|0)|0) + 1876|0);
  $5 = HEAP32[$4>>2]|0;
  $6 = ($5|0)==($3|0);
  if ($6) {
   STACKTOP = sp;return;
  }
  $7 = ((($this) + (($0*24)|0)|0) + 1868|0);
  $8 = (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$7,$time)|0);
  $9 = (($8) + 8|0);
  HEAP32[$9>>2] = $3;
  STACKTOP = sp;return;
  break;
 }
 case 15: case 14: case 13:  {
  $10 = ($data|0)<(4096);
  if (!($10)) {
   STACKTOP = sp;return;
  }
  $11 = (($addr) + -13)|0;
  $12 = ((($this) + (($11*24)|0)|0) + 1868|0);
  $13 = (($time) + -1)|0;
  $14 = (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$12,$13)|0);
  $15 = (($14) + 20|0);
  HEAP32[$15>>2] = 0;
  STACKTOP = sp;return;
  break;
 }
 case 9: case 8:  {
  $16 = $data&255;
  $17 = ((($this) + ($addr)|0) + 1956|0);
  HEAP8[$17>>0] = $16;
  STACKTOP = sp;return;
  break;
 }
 case 1:  {
  $18 = $data & 16;
  $19 = ($18|0)==(0);
  if (!($19)) {
   $20 = (($this) + 1960|0);
   HEAP8[$20>>0] = 0;
   $21 = (($this) + 1961|0);
   HEAP8[$21>>0] = 0;
  }
  $22 = $data & 32;
  $23 = ($22|0)==(0);
  if (!($23)) {
   $24 = (($this) + 1962|0);
   HEAP8[$24>>0] = 0;
   $25 = (($this) + 1963|0);
   HEAP8[$25>>0] = 0;
  }
  $26 = $data & 1;
  $27 = (($this) + 1884|0);
  $28 = HEAP32[$27>>2]|0;
  $29 = ($28|0)==($26|0);
  if (!($29)) {
   $30 = (($this) + 1868|0);
   $31 = (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$30,$time)|0);
   $32 = (($31) + 16|0);
   HEAP32[$32>>2] = $26;
   $33 = ($26|0)==(0);
   if (!($33)) {
    $34 = (($31) + 12|0);
    HEAP32[$34>>2] = 0;
    $35 = (($31) + 20|0);
    HEAP32[$35>>2] = 0;
   }
  }
  $36 = $data >>> 1;
  $37 = $36 & 1;
  $38 = (($this) + 1908|0);
  $39 = HEAP32[$38>>2]|0;
  $40 = ($39|0)==($37|0);
  if (!($40)) {
   $41 = (($this) + 1892|0);
   $42 = (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$41,$time)|0);
   $43 = (($42) + 16|0);
   HEAP32[$43>>2] = $37;
   $44 = ($37|0)==(0);
   if (!($44)) {
    $45 = (($42) + 12|0);
    HEAP32[$45>>2] = 0;
    $46 = (($42) + 20|0);
    HEAP32[$46>>2] = 0;
   }
  }
  $47 = $data >>> 2;
  $48 = $47 & 1;
  $49 = (($this) + 1932|0);
  $50 = HEAP32[$49>>2]|0;
  $51 = ($50|0)==($48|0);
  if (!($51)) {
   $52 = (($this) + 1916|0);
   $53 = (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$52,$time)|0);
   $54 = (($53) + 16|0);
   HEAP32[$54>>2] = $48;
   $55 = ($48|0)==(0);
   if (!($55)) {
    $56 = (($53) + 12|0);
    HEAP32[$56>>2] = 0;
    $57 = (($53) + 20|0);
    HEAP32[$57>>2] = 0;
   }
  }
  $58 = $data & 128;
  __ZN8SNES_SPC10enable_romEi($this,$58);
  STACKTOP = sp;return;
  break;
 }
 default: {
  STACKTOP = sp;return;
 }
 }
}
function __ZN8SNES_SPC9run_timerEPNS_5TimerEi($this,$t,$time) {
 $this = $this|0;
 $t = $t|0;
 $time = $time|0;
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$t>>2]|0;
 $1 = ($0|0)>($time|0);
 if ($1) {
  $$0 = $t;
 } else {
  $2 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$t,$time)|0);
  $$0 = $2;
 }
 STACKTOP = sp;return ($$0|0);
}
function __ZN8SNES_SPC17cpu_write_smp_regEiii($this,$data,$time,$addr) {
 $this = $this|0;
 $data = $data|0;
 $time = $time|0;
 $addr = $addr|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($addr|0)==(3);
 if ($0) {
  __ZN8SNES_SPC9dsp_writeEii($this,$data,$time);
  STACKTOP = sp;return;
 } else {
  __ZN8SNES_SPC18cpu_write_smp_reg_Eiii($this,$data,$time,$addr);
  STACKTOP = sp;return;
 }
}
function __ZN8SNES_SPC9dsp_writeEii($this,$data,$time) {
 $this = $this|0;
 $data = $data|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1942|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1&255;
 $3 = ((($this) + ($2)|0) + 1612|0);
 $4 = HEAP8[$3>>0]|0;
 $5 = $4 << 24 >> 24;
 $6 = (($time) - ($5))|0;
 $7 = (($this) + 1996|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = (($6) - ($8))|0;
 $10 = ($9|0)>(-1);
 do {
  if ($10) {
   $11 = (($9) + 32)|0;
   $12 = $11 & -32;
   $13 = (($12) + ($8))|0;
   HEAP32[$7>>2] = $13;
   __ZN7SPC_DSP3runEi($this,$12);
  } else {
   $14 = ($8|0)==(127);
   if ($14) {
    if ((($1<<24>>24) == 76)) {
     $15 = (__ZNK7SPC_DSP4readEi($this,92)|0);
     $16 = $15 ^ -1;
     $17 = $16 & $data;
     $18 = (($this) + 2012|0);
     $19 = HEAP32[$18>>2]|0;
     $20 = $19 | $17;
     HEAP32[$18>>2] = $20;
     break;
    } else if ((($1<<24>>24) == 92)) {
     $21 = (($this) + 2016|0);
     $22 = HEAP32[$21>>2]|0;
     $23 = $22 | $data;
     HEAP32[$21>>2] = $23;
     $24 = $data ^ -1;
     $25 = (($this) + 2012|0);
     $26 = HEAP32[$25>>2]|0;
     $27 = $26 & $24;
     HEAP32[$25>>2] = $27;
     break;
    } else {
     break;
    }
   }
  }
 } while(0);
 $28 = HEAP8[$0>>0]|0;
 $29 = ($28<<24>>24)>(-1);
 if (!($29)) {
  STACKTOP = sp;return;
 }
 $30 = $28&255;
 __ZN7SPC_DSP5writeEii($this,$30,$data);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC14cpu_write_highEiii($this,$data,$i,$time) {
 $this = $this|0;
 $data = $data|0;
 $i = $i|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($i|0)<(64);
 if ($0) {
  $1 = $data&255;
  $2 = ((($this) + ($i)|0) + 2140|0);
  HEAP8[$2>>0] = $1;
  $3 = (($this) + 2072|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==(0);
  if ($5) {
   STACKTOP = sp;return;
  }
  $6 = ((($this) + ($i)|0) + 2076|0);
  $7 = HEAP8[$6>>0]|0;
  $8 = (($i) + 65472)|0;
  $9 = ((($this) + ($8)|0) + 2716|0);
  HEAP8[$9>>0] = $7;
  STACKTOP = sp;return;
 } else {
  $10 = (($i) + 65472)|0;
  $11 = ((($this) + ($10)|0) + 2716|0);
  $12 = HEAP8[$11>>0]|0;
  $13 = $data&255;
  $14 = ($12<<24>>24)==($13<<24>>24);
  if (!($14)) {
   ___assert_fail((336|0),(376|0),405,(392|0));
   // unreachable;
  }
  HEAP8[$11>>0] = -1;
  $15 = (($i) + -64)|0;
  __ZN8SNES_SPC9cpu_writeEiii($this,$data,$15,$time);
  STACKTOP = sp;return;
 }
}
function __ZN8SNES_SPC9cpu_writeEiii($this,$data,$addr,$time) {
 $this = $this|0;
 $data = $data|0;
 $addr = $addr|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $data&255;
 $1 = ((($this) + ($addr)|0) + 2716|0);
 HEAP8[$1>>0] = $0;
 $2 = (($addr) + -240)|0;
 $3 = ($2|0)>(-1);
 do {
  if ($3) {
   $4 = ($2|0)<(16);
   if ($4) {
    $5 = ((($this) + ($2)|0) + 1940|0);
    HEAP8[$5>>0] = $0;
    $6 = -788594688 << $2;
    $7 = ($6|0)<(0);
    if (!($7)) {
     break;
    }
    __ZN8SNES_SPC17cpu_write_smp_regEiii($this,$data,$time,$2);
    break;
   } else {
    $8 = (($addr) + -65472)|0;
    $9 = ($8|0)>(-1);
    if (!($9)) {
     break;
    }
    __ZN8SNES_SPC14cpu_write_highEiii($this,$data,$8,$time);
    break;
   }
  }
 } while(0);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC8cpu_readEii($this,$addr,$time) {
 $this = $this|0;
 $addr = $addr|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $addr$tr = 0;
 var $or$cond = 0, $result$0 = 0, $t$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $addr$tr = $addr;
 while(1) {
  $0 = (($addr$tr) + -240)|0;
  $1 = ($0|0)>(-1);
  $2 = (($addr$tr) + -256)|0;
  $3 = ($2>>>0)>(65279);
  $or$cond = $1 & $3;
  if (!($or$cond)) {
   label = 11;
   break;
  }
  $4 = (($addr$tr) + -253)|0;
  $5 = ($4>>>0)<(3);
  if ($5) {
   label = 4;
   break;
  }
  $12 = ($4|0)<(0);
  if ($12) {
   label = 8;
   break;
  }
  $14 = (($addr$tr) + -65536)|0;
  $15 = ($14|0)<(256);
  if ($15) {
   $addr$tr = $14;
  } else {
   label = 10;
   break;
  }
 }
 if ((label|0) == 4) {
  $6 = ((($this) + (($4*24)|0)|0) + 1868|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)>($time|0);
  if ($8) {
   $t$0 = $6;
  } else {
   $9 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$6,$time)|0);
   $t$0 = $9;
  }
  $10 = (($t$0) + 20|0);
  $11 = HEAP32[$10>>2]|0;
  HEAP32[$10>>2] = 0;
  $result$0 = $11;
  STACKTOP = sp;return ($result$0|0);
 }
 else if ((label|0) == 8) {
  $13 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$0,$time)|0);
  $result$0 = $13;
  STACKTOP = sp;return ($result$0|0);
 }
 else if ((label|0) == 10) {
  ___assert_fail((408|0),(376|0),497,(456|0));
  // unreachable;
 }
 else if ((label|0) == 11) {
  $16 = ((($this) + ($addr$tr)|0) + 2716|0);
  $17 = HEAP8[$16>>0]|0;
  $18 = $17&255;
  $result$0 = $18;
  STACKTOP = sp;return ($result$0|0);
 }
 return 0|0;
}
function __ZN8SNES_SPC16cpu_read_smp_regEii($this,$reg,$time) {
 $this = $this|0;
 $reg = $reg|0;
 $time = $time|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $result$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($this) + ($reg)|0) + 1956|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1&255;
 $3 = (($reg) + -2)|0;
 $4 = ($3>>>0)<(2);
 if ($4) {
  $5 = (($this) + 1942|0);
  $6 = HEAP8[$5>>0]|0;
  $7 = $6&255;
  $8 = ($3|0)==(1);
  if ($8) {
   $9 = (__ZN8SNES_SPC8dsp_readEi($this,$time)|0);
   $result$0 = $9;
  } else {
   $result$0 = $7;
  }
 } else {
  $result$0 = $2;
 }
 STACKTOP = sp;return ($result$0|0);
}
function __ZN8SNES_SPC9end_frameEi($this,$end_time) {
 $this = $this|0;
 $end_time = $end_time|0;
 var $$off = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2000|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)<($end_time|0);
 if ($2) {
  (__ZN8SNES_SPC10run_until_Ei($this,$end_time)|0);
 }
 $3 = HEAP32[$0>>2]|0;
 $4 = (($3) - ($end_time))|0;
 HEAP32[$0>>2] = $4;
 $5 = (($this) + 2024|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = (($6) + ($end_time))|0;
 HEAP32[$5>>2] = $7;
 $8 = HEAP32[$0>>2]|0;
 $$off = (($8) + 11)|0;
 $9 = ($$off>>>0)<(12);
 if (!($9)) {
  ___assert_fail((472|0),(376|0),546,(520|0));
  // unreachable;
 }
 $10 = (($this) + 1868|0);
 (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$10,0)|0);
 $11 = (($this) + 1892|0);
 (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$11,0)|0);
 $12 = (($this) + 1916|0);
 (__ZN8SNES_SPC9run_timerEPNS_5TimerEi(0,$12,0)|0);
 $13 = (($this) + 1996|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = ($14|0)<(0);
 if ($15) {
  $16 = (-29 - ($14))|0;
  $17 = ($16|0)>(-1);
  if ($17) {
   $18 = (($16) + 32)|0;
   $19 = $18 & -32;
   $20 = (($19) + ($14))|0;
   HEAP32[$13>>2] = $20;
   __ZN7SPC_DSP3runEi($this,$19);
  }
 }
 $21 = (($this) + 2028|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = ($22|0)==(0|0);
 if ($23) {
  STACKTOP = sp;return;
 }
 __ZN8SNES_SPC10save_extraEv($this);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC10run_until_Ei($this,$end_time) {
 $this = $this|0;
 $end_time = $end_time|0;
 var $$ = 0, $$21 = 0, $$22 = 0, $$23 = 0, $$24 = 0, $$25 = 0, $$26 = 0, $$27 = 0, $$28 = 0, $$29 = 0, $$30 = 0, $$data$43 = 0, $$masked = 0, $$sum = 0, $$sum1 = 0, $$sum11 = 0, $$sum13 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0;
 var $$sum19 = 0, $$sum3 = 0, $$sum5 = 0, $$sum7 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0;
 var $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0;
 var $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0;
 var $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0;
 var $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0, $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $1080 = 0, $1081 = 0, $1082 = 0;
 var $1083 = 0, $1084 = 0, $1085 = 0, $1086 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0;
 var $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0;
 var $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0;
 var $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0;
 var $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0;
 var $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0;
 var $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0;
 var $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0;
 var $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0;
 var $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0;
 var $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0;
 var $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0;
 var $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0;
 var $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0;
 var $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0;
 var $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0;
 var $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0;
 var $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0;
 var $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0;
 var $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0;
 var $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0;
 var $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0;
 var $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0;
 var $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0;
 var $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0;
 var $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0;
 var $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0, $805 = 0, $806 = 0, $807 = 0;
 var $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0, $823 = 0, $824 = 0, $825 = 0;
 var $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0, $841 = 0, $842 = 0, $843 = 0;
 var $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0, $86 = 0, $860 = 0, $861 = 0;
 var $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0, $878 = 0, $879 = 0, $88 = 0;
 var $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0, $896 = 0, $897 = 0, $898 = 0;
 var $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0, $913 = 0, $914 = 0, $915 = 0;
 var $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0, $931 = 0, $932 = 0, $933 = 0;
 var $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0, $95 = 0, $950 = 0, $951 = 0;
 var $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0, $968 = 0, $969 = 0, $97 = 0;
 var $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0, $986 = 0, $987 = 0, $988 = 0;
 var $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $a$0 = 0, $a$1$be = 0, $a$157 = 0, $a$188 = 0, $a$2 = 0, $a$3 = 0, $a$4 = 0, $a$5 = 0;
 var $a$6 = 0, $addr28$0 = 0, $addr29$0 = 0, $addr31$0 = 0, $addr33$0 = 0, $addr33$1 = 0, $c$0 = 0, $c$1$be = 0, $c$10 = 0, $c$11 = 0, $c$12 = 0, $c$13 = 0, $c$139 = 0, $c$163 = 0, $c$2 = 0, $c$3 = 0, $c$4 = 0, $c$5 = 0, $c$6 = 0, $c$7 = 0;
 var $c$8 = 0, $c$9 = 0, $data$0 = 0, $data$1 = 0, $data$10 = 0, $data$11 = 0, $data$12 = 0, $data$13 = 0, $data$14 = 0, $data$15 = 0, $data$16 = 0, $data$17 = 0, $data$18 = 0, $data$19 = 0, $data$2 = 0, $data$20 = 0, $data$21 = 0, $data$22 = 0, $data$23 = 0, $data$24 = 0;
 var $data$25 = 0, $data$26 = 0, $data$27 = 0, $data$28 = 0, $data$29 = 0, $data$3 = 0, $data$30 = 0, $data$31 = 0, $data$32 = 0, $data$33 = 0, $data$34 = 0, $data$35 = 0, $data$36 = 0, $data$37 = 0, $data$38 = 0, $data$39 = 0, $data$4 = 0, $data$40 = 0, $data$41 = 0, $data$43 = 0;
 var $data$45 = 0, $data$46 = 0, $data$47 = 0, $data$48 = 0, $data$49 = 0, $data$5 = 0, $data$50 = 0, $data$51 = 0, $data$6 = 0, $data$7 = 0, $data$8 = 0, $data$9 = 0, $dp$0$be = 0, $dp$033 = 0, $dp$060 = 0, $hi$0 = 0, $lo$0 = 0, $nz$0 = 0, $nz$1$be = 0, $nz$136 = 0;
 var $nz$161 = 0, $nz$2 = 0, $pc$0 = 0, $pc$1 = 0, $pc$10 = 0, $pc$11 = 0, $pc$12 = 0, $pc$13 = 0, $pc$14 = 0, $pc$15 = 0, $pc$16 = 0, $pc$17 = 0, $pc$18 = 0, $pc$19 = 0, $pc$2$be = 0, $pc$20 = 0, $pc$21 = 0, $pc$22 = 0, $pc$24 = 0, $pc$248 = 0;
 var $pc$25 = 0, $pc$26 = 0, $pc$268 = 0, $pc$27 = 0, $pc$28 = 0, $pc$29 = 0, $pc$3 = 0, $pc$4 = 0, $pc$5 = 0, $pc$6 = 0, $pc$7 = 0, $pc$8 = 0, $pc$9 = 0, $psw$0 = 0, $psw$1$be = 0, $psw$142 = 0, $psw$165 = 0, $psw$3 = 0, $rel_time$0 = 0, $rel_time$1$be = 0;
 var $rel_time$2 = 0, $sp$0$be = 0, $sp$045 = 0, $sp$067 = 0, $sp$1 = 0, $sp$2 = 0, $t$0 = 0, $t14$0 = 0, $t19$0 = 0, $t25$0 = 0, $t44$0 = 0, $t5$0 = 0, $temp$0 = 0, $temp27$0 = 0, $temp40$0 = 0, $temp53$0 = 0, $x$0 = 0, $x$1$be = 0, $x$154 = 0, $x$175 = 0;
 var $y$0 = 0, $y$1$be = 0, $y$151 = 0, $y$169 = 0, $y$2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2000|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (($1) - ($end_time))|0;
 $3 = ($2|0)<(1);
 if (!($3)) {
  ___assert_fail((536|0),(552|0),163,(568|0));
  // unreachable;
 }
 HEAP32[$0>>2] = $end_time;
 $4 = (($this) + 1996|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = (($5) + ($2))|0;
 HEAP32[$4>>2] = $6;
 $7 = (($this) + 1868|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = (($8) + ($2))|0;
 HEAP32[$7>>2] = $9;
 $10 = (($this) + 1892|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = (($11) + ($2))|0;
 HEAP32[$10>>2] = $12;
 $13 = (($this) + 1916|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = (($14) + ($2))|0;
 HEAP32[$13>>2] = $15;
 $16 = (($this) + 2716|0);
 $17 = (($this) + 1976|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = (($this) + 1980|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = (($this) + 1984|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = (($this) + 1972|0);
 $24 = HEAP32[$23>>2]|0;
 $25 = ((($this) + ($24)|0) + 2716|0);
 $26 = (($this) + 1992|0);
 $27 = HEAP32[$26>>2]|0;
 $$sum = (($27) + 257)|0;
 $28 = ((($this) + ($$sum)|0) + 2716|0);
 $29 = (($this) + 1988|0);
 $30 = HEAP32[$29>>2]|0;
 $31 = $30 << 8;
 $32 = $30 << 3;
 $33 = $32 & 256;
 $34 = $30 << 4;
 $35 = $34 & 2048;
 $36 = $30 & 2;
 $37 = $35 | $36;
 $38 = $37 ^ 2;
 $39 = HEAP8[$25>>0]|0;
 $40 = $39&255;
 $41 = ((($this) + ($40)|0) + 2204|0);
 $42 = HEAP8[$41>>0]|0;
 $43 = $42&255;
 $44 = (($43) + ($2))|0;
 $45 = ($44|0)>(0);
 L4: do {
  if ($45) {
   $a$157 = $18;$c$139 = $31;$dp$033 = $33;$nz$136 = $38;$pc$248 = $25;$psw$142 = $30;$rel_time$2 = $2;$sp$045 = $28;$x$154 = $20;$y$151 = $22;
  } else {
   $46 = $16;
   $47 = $16;
   $48 = $16;
   $49 = $16;
   $50 = (($this) + 68218|0);
   $51 = $16;
   $52 = $16;
   $53 = $16;
   $54 = $16;
   $55 = $16;
   $56 = $16;
   $57 = $16;
   $58 = $16;
   $59 = $16;
   $60 = $16;
   $61 = $16;
   $499 = $39;$76 = $40;$83 = $44;$a$188 = $18;$c$163 = $31;$dp$060 = $33;$nz$161 = $38;$pc$268 = $25;$psw$165 = $30;$sp$067 = $28;$x$175 = $20;$y$169 = $22;
   L6: while(1) {
    $73 = (($pc$268) + 1|0);
    $74 = HEAP8[$73>>0]|0;
    $75 = $74&255;
    L8: do {
     switch ($76|0) {
     case 232:  {
      $a$0 = $75;$c$0 = $c$163;$nz$0 = $75;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 0:  {
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 240:  {
      $77 = $74 << 24 >> 24;
      $$sum19 = (($77) + 2)|0;
      $78 = (($pc$268) + ($$sum19)|0);
      $79 = $nz$161&255;
      $80 = ($79<<24>>24)==(0);
      if ($80) {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $78;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $81 = (($pc$268) + 2|0);
       $82 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $81;$psw$1$be = $psw$165;$rel_time$1$be = $82;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 63:  {
      $90 = $73;
      $91 = (($90) - ($46))|0;
      $92 = (($91) + 2)|0;
      $93 = (__Z8get_le16PKv($73)|0);
      $94 = ((($this) + ($93)|0) + 2716|0);
      $95 = (($sp$067) + -2|0);
      $96 = $95;
      $97 = (($96) - ($46))|0;
      $98 = ($97|0)>(256);
      if ($98) {
       __Z8set_le16Pvj($95,$92);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $94;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $95;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      } else {
       $99 = $92&255;
       $100 = $97 & 255;
       $101 = $100 | 256;
       $102 = ((($this) + ($101)|0) + 2716|0);
       HEAP8[$102>>0] = $99;
       $103 = $92 >>> 8;
       $104 = $103&255;
       $105 = (($sp$067) + -1|0);
       HEAP8[$105>>0] = $104;
       $106 = (($sp$067) + 254|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $94;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $106;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      }
      break;
     }
     case 208:  {
      $84 = $74 << 24 >> 24;
      $$sum17 = (($84) + 2)|0;
      $85 = (($pc$268) + ($$sum17)|0);
      $86 = $nz$161&255;
      $87 = ($86<<24>>24)==(0);
      if ($87) {
       $88 = (($pc$268) + 2|0);
       $89 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $88;$psw$1$be = $psw$165;$rel_time$1$be = $89;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $85;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 250:  {
      $141 = (($83) + -2)|0;
      $142 = $75 | $dp$060;
      $143 = (($142) + -253)|0;
      $144 = ($143>>>0)<(3);
      if ($144) {
       $145 = ((($this) + (($143*24)|0)|0) + 1868|0);
       $146 = HEAP32[$145>>2]|0;
       $147 = ($141|0)<($146|0);
       if ($147) {
        $t5$0 = $145;
       } else {
        $148 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$145,$141)|0);
        $t5$0 = $148;
       }
       $149 = (($t5$0) + 20|0);
       $150 = HEAP32[$149>>2]|0;
       HEAP32[$149>>2] = 0;
       $temp$0 = $150;
      } else {
       $151 = ((($this) + ($142)|0) + 2716|0);
       $152 = HEAP8[$151>>0]|0;
       $153 = $152&255;
       $154 = (($142) + -240)|0;
       $155 = ($154>>>0)<(16);
       if ($155) {
        $156 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$154,$141)|0);
        $temp$0 = $156;
       } else {
        $temp$0 = $153;
       }
      }
      $157 = (($temp$0) + 8192)|0;
      $data$0 = $157;
      label = 31;
      break;
     }
     case 111:  {
      $107 = $sp$067;
      $108 = (($107) - ($47))|0;
      $109 = (__Z8get_le16PKv($sp$067)|0);
      $110 = ((($this) + ($109)|0) + 2716|0);
      $111 = (($sp$067) + 2|0);
      $112 = ($108|0)<(511);
      if ($112) {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $110;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $111;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $113 = (($sp$067) + -255|0);
       $114 = HEAP8[$113>>0]|0;
       $115 = $114&255;
       $116 = $115 << 8;
       $117 = $108 & 255;
       $118 = $117 | 256;
       $119 = ((($this) + ($118)|0) + 2716|0);
       $120 = HEAP8[$119>>0]|0;
       $121 = $120&255;
       $122 = $116 | $121;
       $123 = ((($this) + ($122)|0) + 2716|0);
       $124 = (($sp$067) + -254|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $123;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $124;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 228:  {
      $125 = (($pc$268) + 2|0);
      $126 = $75 | $dp$060;
      $127 = (($126) + -253)|0;
      $128 = ($127>>>0)<(3);
      if (!($128)) {
       $135 = ((($this) + ($126)|0) + 2716|0);
       $136 = HEAP8[$135>>0]|0;
       $137 = $136&255;
       $138 = (($126) + -240)|0;
       $139 = ($138>>>0)<(16);
       if (!($139)) {
        $a$1$be = $137;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $137;$pc$2$be = $125;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
        break L8;
       }
       $140 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$138,$83)|0);
       $a$1$be = $140;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $140;$pc$2$be = $125;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      }
      $129 = ((($this) + (($127*24)|0)|0) + 1868|0);
      $130 = HEAP32[$129>>2]|0;
      $131 = ($83|0)<($130|0);
      if ($131) {
       $t$0 = $129;
      } else {
       $132 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$129,$83)|0);
       $t$0 = $132;
      }
      $133 = (($t$0) + 20|0);
      $134 = HEAP32[$133>>2]|0;
      HEAP32[$133>>2] = 0;
      $a$1$be = $134;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $134;$pc$2$be = $125;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 143:  {
      $data$0 = $75;
      label = 31;
      break;
     }
     case 230:  {
      $180 = (($x$175) + ($dp$060))|0;
      $data$2 = $180;$pc$3 = $pc$268;
      label = 46;
      break;
     }
     case 247:  {
      $181 = $75 | $dp$060;
      $182 = ((($this) + ($181)|0) + 2716|0);
      $183 = (__Z8get_le16PKv($182)|0);
      $184 = (($183) + ($y$169))|0;
      $data$2 = $184;$pc$3 = $73;
      label = 46;
      break;
     }
     case 231:  {
      $185 = (($75) + ($x$175))|0;
      $186 = $185 & 255;
      $187 = $186 | $dp$060;
      $188 = ((($this) + ($187)|0) + 2716|0);
      $189 = (__Z8get_le16PKv($188)|0);
      $data$2 = $189;$pc$3 = $73;
      label = 46;
      break;
     }
     case 246:  {
      $190 = (($75) + ($y$169))|0;
      $data$1 = $190;
      label = 44;
      break;
     }
     case 245:  {
      $191 = (($75) + ($x$175))|0;
      $data$1 = $191;
      label = 44;
      break;
     }
     case 229:  {
      $data$1 = $75;
      label = 44;
      break;
     }
     case 196:  {
      $170 = (($pc$268) + 2|0);
      $171 = $75 | $dp$060;
      $172 = $a$188&255;
      $173 = ((($this) + ($171)|0) + 2716|0);
      HEAP8[$173>>0] = $172;
      $174 = (($171) + -240)|0;
      $175 = ($174>>>0)<(16);
      if ($175) {
       $176 = (($171) + -242)|0;
       $177 = ((($this) + ($174)|0) + 1940|0);
       HEAP8[$177>>0] = $172;
       $178 = ($176|0)==(1);
       if ($178) {
        __ZN8SNES_SPC9dsp_writeEii($this,$a$188,$83);
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $170;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
        break L8;
       }
       $179 = ($176>>>0)>(1);
       if ($179) {
        __ZN8SNES_SPC18cpu_write_smp_reg_Eiii($this,$a$188,$83,$174);
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $170;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
       } else {
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $170;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
       }
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $170;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 191:  {
      $201 = (($x$175) + ($dp$060))|0;
      $202 = (($x$175) + 1)|0;
      $203 = $202 & 255;
      $204 = (($83) + -1)|0;
      $205 = (__ZN8SNES_SPC8cpu_readEii($this,$201,$204)|0);
      $a$1$be = $205;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $205;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $203;$y$1$be = $y$169;
      break;
     }
     case 249:  {
      $206 = (($75) + ($y$169))|0;
      $207 = $206 & 255;
      $data$3 = $207;
      label = 49;
      break;
     }
     case 248:  {
      $data$3 = $75;
      label = 49;
      break;
     }
     case 244:  {
      $197 = (($75) + ($x$175))|0;
      $198 = $197 & 255;
      $199 = $198 | $dp$060;
      $data$2 = $199;$pc$3 = $73;
      label = 46;
      break;
     }
     case 236:  {
      $244 = (__Z8get_le16PKv($73)|0);
      $245 = (($pc$268) + 3|0);
      $246 = (($244) + -253)|0;
      $247 = ($246>>>0)<(3);
      if (!($247)) {
       $254 = ((($this) + ($244)|0) + 2716|0);
       $255 = HEAP8[$254>>0]|0;
       $256 = $255&255;
       $257 = (($244) + -240)|0;
       $258 = ($257>>>0)<(16);
       if (!($258)) {
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $256;$pc$2$be = $245;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $256;
        break L8;
       }
       $259 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$257,$83)|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $259;$pc$2$be = $245;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $259;
       break L8;
      }
      $248 = ((($this) + (($246*24)|0)|0) + 1868|0);
      $249 = HEAP32[$248>>2]|0;
      $250 = ($83|0)<($249|0);
      if ($250) {
       $t25$0 = $248;
      } else {
       $251 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$248,$83)|0);
       $t25$0 = $251;
      }
      $252 = (($t25$0) + 20|0);
      $253 = HEAP32[$252>>2]|0;
      HEAP32[$252>>2] = 0;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $253;$pc$2$be = $245;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $253;
      break;
     }
     case 141:  {
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $75;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $75;
      label = 6;
      break;
     }
     case 198:  {
      $260 = (($x$175) + ($dp$060))|0;
      $data$7 = $260;$pc$5 = $pc$268;
      label = 78;
      break;
     }
     case 233:  {
      $223 = (__Z8get_le16PKv($73)|0);
      $224 = (($pc$268) + 2|0);
      $225 = (__ZN8SNES_SPC8cpu_readEii($this,$223,$83)|0);
      $data$4 = $225;$pc$4 = $224;
      label = 56;
      break;
     }
     case 205:  {
      $data$4 = $75;$pc$4 = $73;
      label = 56;
      break;
     }
     case 251:  {
      $226 = (($75) + ($x$175))|0;
      $227 = $226 & 255;
      $data$5 = $227;
      label = 58;
      break;
     }
     case 235:  {
      $data$5 = $75;
      label = 58;
      break;
     }
     case 197:  {
      $data$6 = $75;
      label = 76;
      break;
     }
     case 212:  {
      $277 = (($75) + ($x$175))|0;
      $278 = $277 & 255;
      $279 = $278 | $dp$060;
      $data$7 = $279;$pc$5 = $73;
      label = 78;
      break;
     }
     case 201:  {
      $temp27$0 = $x$175;
      label = 80;
      break;
     }
     case 204:  {
      $temp27$0 = $y$169;
      label = 80;
      break;
     }
     case 217:  {
      $282 = (($75) + ($y$169))|0;
      $283 = $282 & 255;
      $data$8 = $283;
      label = 82;
      break;
     }
     case 216:  {
      $data$8 = $75;
      label = 82;
      break;
     }
     case 219:  {
      $285 = (($75) + ($x$175))|0;
      $286 = $285 & 255;
      $data$9 = $286;
      label = 84;
      break;
     }
     case 203:  {
      $data$9 = $75;
      label = 84;
      break;
     }
     case 125:  {
      $a$1$be = $x$175;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $x$175;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 215:  {
      $261 = $75 | $dp$060;
      $262 = ((($this) + ($261)|0) + 2716|0);
      $263 = (__Z8get_le16PKv($262)|0);
      $264 = (($263) + ($y$169))|0;
      $data$7 = $264;$pc$5 = $73;
      label = 78;
      break;
     }
     case 199:  {
      $265 = (($75) + ($x$175))|0;
      $266 = $265 & 255;
      $267 = $266 | $dp$060;
      $268 = ((($this) + ($267)|0) + 2716|0);
      $269 = (__Z8get_le16PKv($268)|0);
      $data$7 = $269;$pc$5 = $73;
      label = 78;
      break;
     }
     case 214:  {
      $270 = (($75) + ($y$169))|0;
      $data$6 = $270;
      label = 76;
      break;
     }
     case 213:  {
      $271 = (($75) + ($x$175))|0;
      $data$6 = $271;
      label = 76;
      break;
     }
     case 221:  {
      $a$1$be = $y$169;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $y$169;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 93:  {
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $a$188;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $a$188;$y$1$be = $y$169;
      break;
     }
     case 253:  {
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $a$188;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $a$188;
      break;
     }
     case 175:  {
      $292 = (($a$188) + 8192)|0;
      $293 = (($x$175) + ($dp$060))|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$292,$293,$83);
      $294 = (($x$175) + 1)|0;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $294;$y$1$be = $y$169;
      break;
     }
     case 38:  {
      $295 = (($x$175) + ($dp$060))|0;
      $data$12 = $295;$pc$6 = $pc$268;
      label = 100;
      break;
     }
     case 55:  {
      $296 = $75 | $dp$060;
      $297 = ((($this) + ($296)|0) + 2716|0);
      $298 = (__Z8get_le16PKv($297)|0);
      $299 = (($298) + ($y$169))|0;
      $data$12 = $299;$pc$6 = $73;
      label = 100;
      break;
     }
     case 39:  {
      $300 = (($75) + ($x$175))|0;
      $301 = $300 & 255;
      $302 = $301 | $dp$060;
      $303 = ((($this) + ($302)|0) + 2716|0);
      $304 = (__Z8get_le16PKv($303)|0);
      $data$12 = $304;$pc$6 = $73;
      label = 100;
      break;
     }
     case 54:  {
      $305 = (($75) + ($y$169))|0;
      $data$10 = $305;
      label = 97;
      break;
     }
     case 53:  {
      $306 = (($75) + ($x$175))|0;
      $data$10 = $306;
      label = 97;
      break;
     }
     case 37:  {
      $data$10 = $75;
      label = 97;
      break;
     }
     case 52:  {
      $312 = (($75) + ($x$175))|0;
      $313 = $312 & 255;
      $data$11 = $313;
      label = 99;
      break;
     }
     case 157:  {
      $288 = (($sp$067) + -257|0);
      $289 = $288;
      $290 = (($289) - ($48))|0;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $290;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $290;$y$1$be = $y$169;
      break;
     }
     case 189:  {
      $$sum16 = (($x$175) + 257)|0;
      $291 = ((($this) + ($$sum16)|0) + 2716|0);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $291;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 40:  {
      $data$13 = $75;$pc$7 = $73;
      label = 101;
      break;
     }
     case 57:  {
      $317 = (($y$169) + ($dp$060))|0;
      $318 = (($83) + -2)|0;
      $319 = (__ZN8SNES_SPC8cpu_readEii($this,$317,$318)|0);
      $320 = (($x$175) + ($dp$060))|0;
      $addr28$0 = $320;$data$15 = $319;$pc$8 = $73;
      label = 105;
      break;
     }
     case 41:  {
      $321 = $75 | $dp$060;
      $322 = (($83) + -3)|0;
      $323 = (__ZN8SNES_SPC8cpu_readEii($this,$321,$322)|0);
      $data$14 = $323;
      label = 104;
      break;
     }
     case 56:  {
      $data$14 = $75;
      label = 104;
      break;
     }
     case 6:  {
      $332 = (($x$175) + ($dp$060))|0;
      $data$18 = $332;$pc$9 = $pc$268;
      label = 114;
      break;
     }
     case 36:  {
      $data$11 = $75;
      label = 99;
      break;
     }
     case 5:  {
      $data$16 = $75;
      label = 111;
      break;
     }
     case 20:  {
      $349 = (($75) + ($x$175))|0;
      $350 = $349 & 255;
      $data$17 = $350;
      label = 113;
      break;
     }
     case 4:  {
      $data$17 = $75;
      label = 113;
      break;
     }
     case 8:  {
      $data$19 = $75;$pc$10 = $73;
      label = 115;
      break;
     }
     case 25:  {
      $354 = (($y$169) + ($dp$060))|0;
      $355 = (($83) + -2)|0;
      $356 = (__ZN8SNES_SPC8cpu_readEii($this,$354,$355)|0);
      $357 = (($x$175) + ($dp$060))|0;
      $addr29$0 = $357;$data$21 = $356;$pc$11 = $73;
      label = 119;
      break;
     }
     case 9:  {
      $358 = $75 | $dp$060;
      $359 = (($83) + -3)|0;
      $360 = (__ZN8SNES_SPC8cpu_readEii($this,$358,$359)|0);
      $data$20 = $360;
      label = 118;
      break;
     }
     case 23:  {
      $333 = $75 | $dp$060;
      $334 = ((($this) + ($333)|0) + 2716|0);
      $335 = (__Z8get_le16PKv($334)|0);
      $336 = (($335) + ($y$169))|0;
      $data$18 = $336;$pc$9 = $73;
      label = 114;
      break;
     }
     case 7:  {
      $337 = (($75) + ($x$175))|0;
      $338 = $337 & 255;
      $339 = $338 | $dp$060;
      $340 = ((($this) + ($339)|0) + 2716|0);
      $341 = (__Z8get_le16PKv($340)|0);
      $data$18 = $341;$pc$9 = $73;
      label = 114;
      break;
     }
     case 22:  {
      $342 = (($75) + ($y$169))|0;
      $data$16 = $342;
      label = 111;
      break;
     }
     case 21:  {
      $343 = (($75) + ($x$175))|0;
      $data$16 = $343;
      label = 111;
      break;
     }
     case 70:  {
      $369 = (($x$175) + ($dp$060))|0;
      $data$24 = $369;$pc$12 = $pc$268;
      label = 128;
      break;
     }
     case 87:  {
      $370 = $75 | $dp$060;
      $371 = ((($this) + ($370)|0) + 2716|0);
      $372 = (__Z8get_le16PKv($371)|0);
      $373 = (($372) + ($y$169))|0;
      $data$24 = $373;$pc$12 = $73;
      label = 128;
      break;
     }
     case 71:  {
      $374 = (($75) + ($x$175))|0;
      $375 = $374 & 255;
      $376 = $375 | $dp$060;
      $377 = ((($this) + ($376)|0) + 2716|0);
      $378 = (__Z8get_le16PKv($377)|0);
      $data$24 = $378;$pc$12 = $73;
      label = 128;
      break;
     }
     case 86:  {
      $379 = (($75) + ($y$169))|0;
      $data$22 = $379;
      label = 125;
      break;
     }
     case 85:  {
      $380 = (($75) + ($x$175))|0;
      $data$22 = $380;
      label = 125;
      break;
     }
     case 69:  {
      $data$22 = $75;
      label = 125;
      break;
     }
     case 24:  {
      $data$20 = $75;
      label = 118;
      break;
     }
     case 68:  {
      $data$23 = $75;
      label = 127;
      break;
     }
     case 72:  {
      $data$25 = $75;$pc$13 = $73;
      label = 129;
      break;
     }
     case 89:  {
      $391 = (($y$169) + ($dp$060))|0;
      $392 = (($83) + -2)|0;
      $393 = (__ZN8SNES_SPC8cpu_readEii($this,$391,$392)|0);
      $394 = (($x$175) + ($dp$060))|0;
      $addr31$0 = $394;$data$27 = $393;$pc$14 = $73;
      label = 133;
      break;
     }
     case 73:  {
      $395 = $75 | $dp$060;
      $396 = (($83) + -3)|0;
      $397 = (__ZN8SNES_SPC8cpu_readEii($this,$395,$396)|0);
      $data$26 = $397;
      label = 132;
      break;
     }
     case 88:  {
      $data$26 = $75;
      label = 132;
      break;
     }
     case 84:  {
      $386 = (($75) + ($x$175))|0;
      $387 = $386 & 255;
      $data$23 = $387;
      label = 127;
      break;
     }
     case 119:  {
      $407 = $75 | $dp$060;
      $408 = ((($this) + ($407)|0) + 2716|0);
      $409 = (__Z8get_le16PKv($408)|0);
      $410 = (($409) + ($y$169))|0;
      $data$30 = $410;$pc$15 = $73;
      label = 142;
      break;
     }
     case 103:  {
      $411 = (($75) + ($x$175))|0;
      $412 = $411 & 255;
      $413 = $412 | $dp$060;
      $414 = ((($this) + ($413)|0) + 2716|0);
      $415 = (__Z8get_le16PKv($414)|0);
      $data$30 = $415;$pc$15 = $73;
      label = 142;
      break;
     }
     case 118:  {
      $416 = (($75) + ($y$169))|0;
      $data$28 = $416;
      label = 139;
      break;
     }
     case 117:  {
      $417 = (($75) + ($x$175))|0;
      $data$28 = $417;
      label = 139;
      break;
     }
     case 101:  {
      $data$28 = $75;
      label = 139;
      break;
     }
     case 116:  {
      $423 = (($75) + ($x$175))|0;
      $424 = $423 & 255;
      $data$29 = $424;
      label = 141;
      break;
     }
     case 100:  {
      $data$29 = $75;
      label = 141;
      break;
     }
     case 102:  {
      $406 = (($x$175) + ($dp$060))|0;
      $data$30 = $406;$pc$15 = $pc$268;
      label = 142;
      break;
     }
     case 121:  {
      $430 = (($y$169) + ($dp$060))|0;
      $431 = (($83) + -2)|0;
      $432 = (__ZN8SNES_SPC8cpu_readEii($this,$430,$431)|0);
      $433 = (($x$175) + ($dp$060))|0;
      $434 = (($83) + -1)|0;
      $435 = (__ZN8SNES_SPC8cpu_readEii($this,$433,$434)|0);
      $436 = (($435) - ($432))|0;
      $437 = $436 ^ -1;
      $438 = $436 & 255;
      $a$1$be = $a$188;$c$1$be = $437;$dp$0$be = $dp$060;$nz$1$be = $438;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 105:  {
      $439 = $75 | $dp$060;
      $440 = (($83) + -3)|0;
      $441 = (__ZN8SNES_SPC8cpu_readEii($this,$439,$440)|0);
      $data$32 = $441;
      label = 146;
      break;
     }
     case 62:  {
      $451 = $75 | $dp$060;
      $data$33 = $451;$pc$17 = $73;
      label = 149;
      break;
     }
     case 120:  {
      $data$32 = $75;
      label = 146;
      break;
     }
     case 30:  {
      $452 = (__Z8get_le16PKv($73)|0);
      $453 = (($pc$268) + 2|0);
      $data$33 = $452;$pc$17 = $453;
      label = 149;
      break;
     }
     case 104:  {
      $data$31 = $75;$pc$16 = $73;
      label = 143;
      break;
     }
     case 200:  {
      $data$34 = $75;$pc$18 = $73;
      label = 150;
      break;
     }
     case 126:  {
      $458 = $75 | $dp$060;
      $data$35 = $458;$pc$19 = $73;
      label = 153;
      break;
     }
     case 94:  {
      $459 = (__Z8get_le16PKv($73)|0);
      $460 = (($pc$268) + 2|0);
      $data$35 = $459;$pc$19 = $460;
      label = 153;
      break;
     }
     case 173:  {
      $data$36 = $75;$pc$20 = $73;
      label = 154;
      break;
     }
     case 153: case 185:  {
      $465 = (($y$169) + ($dp$060))|0;
      $466 = (($83) + -2)|0;
      $467 = (__ZN8SNES_SPC8cpu_readEii($this,$465,$466)|0);
      $468 = (($x$175) + ($dp$060))|0;
      $addr33$0 = $468;$data$38 = $467;$pc$21 = $pc$268;
      label = 158;
      break;
     }
     case 137: case 169:  {
      $469 = $75 | $dp$060;
      $470 = (($83) + -3)|0;
      $471 = (__ZN8SNES_SPC8cpu_readEii($this,$469,$470)|0);
      $data$37 = $471;
      label = 157;
      break;
     }
     case 152: case 184:  {
      $data$37 = $75;
      label = 157;
      break;
     }
     case 166: case 134:  {
      $478 = (($x$175) + ($dp$060))|0;
      $data$41 = $478;$pc$22 = $pc$268;
      label = 167;
      break;
     }
     case 183: case 151:  {
      $479 = $75 | $dp$060;
      $480 = ((($this) + ($479)|0) + 2716|0);
      $481 = (__Z8get_le16PKv($480)|0);
      $482 = (($481) + ($y$169))|0;
      $data$41 = $482;$pc$22 = $73;
      label = 167;
      break;
     }
     case 167: case 135:  {
      $483 = (($75) + ($x$175))|0;
      $484 = $483 & 255;
      $485 = $484 | $dp$060;
      $486 = ((($this) + ($485)|0) + 2716|0);
      $487 = (__Z8get_le16PKv($486)|0);
      $data$41 = $487;$pc$22 = $73;
      label = 167;
      break;
     }
     case 182: case 150:  {
      $488 = (($75) + ($y$169))|0;
      $data$39 = $488;
      label = 164;
      break;
     }
     case 181: case 149:  {
      $489 = (($75) + ($x$175))|0;
      $data$39 = $489;
      label = 164;
      break;
     }
     case 165: case 133:  {
      $data$39 = $75;
      label = 164;
      break;
     }
     case 180: case 148:  {
      $495 = (($75) + ($x$175))|0;
      $496 = $495 & 255;
      $data$40 = $496;
      label = 166;
      break;
     }
     case 164: case 132:  {
      $data$40 = $75;
      label = 166;
      break;
     }
     case 136: case 168:  {
      $addr33$1 = -1;$data$43 = $75;$nz$2 = $a$188;$pc$24 = $73;
      label = 168;
      break;
     }
     case 188:  {
      $518 = (($a$188) + 1)|0;
      $519 = $518 & 255;
      $a$1$be = $519;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $518;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 61:  {
      $520 = (($x$175) + 1)|0;
      $521 = $520 & 255;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $520;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $521;$y$1$be = $y$169;
      break;
     }
     case 156:  {
      $524 = (($a$188) + -1)|0;
      $525 = $524 & 255;
      $a$1$be = $525;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $524;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 29:  {
      $526 = (($x$175) + -1)|0;
      $527 = $526 & 255;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $526;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $527;$y$1$be = $y$169;
      break;
     }
     case 220:  {
      $528 = (($y$169) + -1)|0;
      $529 = $528 & 255;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $528;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $529;
      break;
     }
     case 187: case 155:  {
      $530 = (($75) + ($x$175))|0;
      $531 = $530 & 255;
      $data$45 = $531;
      label = 178;
      break;
     }
     case 171: case 139:  {
      $data$45 = $75;
      label = 178;
      break;
     }
     case 172: case 140:  {
      $533 = (__Z8get_le16PKv($73)|0);
      $534 = (($pc$268) + 2|0);
      $data$46 = $533;$pc$25 = $534;
      label = 180;
      break;
     }
     case 92:  {
      $c$2 = 0;
      label = 182;
      break;
     }
     case 252:  {
      $522 = (($y$169) + 1)|0;
      $523 = $522 & 255;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $522;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $523;
      break;
     }
     case 28:  {
      $c$3 = 0;
      label = 184;
      break;
     }
     case 60:  {
      $c$3 = $c$163;
      label = 184;
      break;
     }
     case 11:  {
      $551 = $75 | $dp$060;
      $c$7 = 0;$data$48 = $551;$pc$26 = $73;
      label = 191;
      break;
     }
     case 27:  {
      $c$4 = 0;
      label = 187;
      break;
     }
     case 59:  {
      $c$4 = $c$163;
      label = 187;
      break;
     }
     case 43:  {
      $c$5 = $c$163;$data$47 = $75;
      label = 188;
      break;
     }
     case 12:  {
      $c$6 = 0;
      label = 190;
      break;
     }
     case 44:  {
      $c$6 = $c$163;
      label = 190;
      break;
     }
     case 75:  {
      $563 = $75 | $dp$060;
      $c$11 = 0;$data$50 = $563;$pc$27 = $73;
      label = 198;
      break;
     }
     case 124:  {
      $c$2 = $c$163;
      label = 182;
      break;
     }
     case 91:  {
      $c$8 = 0;
      label = 194;
      break;
     }
     case 123:  {
      $c$8 = $c$163;
      label = 194;
      break;
     }
     case 107:  {
      $c$9 = $c$163;$data$49 = $75;
      label = 195;
      break;
     }
     case 76:  {
      $c$10 = 0;
      label = 197;
      break;
     }
     case 108:  {
      $c$10 = $c$163;
      label = 197;
      break;
     }
     case 159:  {
      $576 = $a$188 >> 4;
      $577 = $a$188 << 4;
      $578 = $577 & 240;
      $579 = $578 | $576;
      $a$1$be = $579;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $579;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 186:  {
      $580 = $75 | $dp$060;
      $581 = (($83) + -2)|0;
      $582 = (__ZN8SNES_SPC8cpu_readEii($this,$580,$581)|0);
      $583 = $582 & 127;
      $584 = $582 >> 1;
      $585 = $583 | $584;
      $586 = (($75) + 1)|0;
      $587 = $586 & 255;
      $588 = $587 | $dp$060;
      $589 = (__ZN8SNES_SPC8cpu_readEii($this,$588,$83)|0);
      $590 = $585 | $589;
      $a$0 = $582;$c$0 = $c$163;$nz$0 = $590;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $589;
      label = 6;
      break;
     }
     case 218:  {
      $591 = $75 | $dp$060;
      $592 = (($83) + -1)|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$a$188,$591,$592);
      $593 = (($y$169) + 8192)|0;
      $594 = (($75) + 1)|0;
      $595 = $594 & 255;
      $596 = $595 | $dp$060;
      __ZN8SNES_SPC9cpu_writeEiii($this,$593,$596,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 26: case 58:  {
      $597 = $75 | $dp$060;
      $598 = (($83) + -3)|0;
      $599 = (__ZN8SNES_SPC8cpu_readEii($this,$597,$598)|0);
      $600 = $76 >>> 4;
      $601 = $600 & 2;
      $602 = (($601) + -1)|0;
      $603 = (($602) + ($599))|0;
      $604 = $603 >>> 1;
      $605 = $604 | $603;
      $606 = $605 & 127;
      $607 = (($83) + -2)|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$603,$597,$607);
      $608 = (($75) + 1)|0;
      $609 = $608 & 255;
      $610 = $609 | $dp$060;
      $611 = $603 >>> 8;
      $612 = (($83) + -1)|0;
      $613 = (__ZN8SNES_SPC8cpu_readEii($this,$610,$612)|0);
      $614 = (($611) + ($613))|0;
      $615 = $614 & 255;
      $616 = $606 | $615;
      __ZN8SNES_SPC9cpu_writeEiii($this,$615,$610,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $616;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 154: case 122:  {
      $617 = $75 | $dp$060;
      $618 = (($83) + -2)|0;
      $619 = (__ZN8SNES_SPC8cpu_readEii($this,$617,$618)|0);
      $620 = (($75) + 1)|0;
      $621 = $620 & 255;
      $622 = $621 | $dp$060;
      $623 = (__ZN8SNES_SPC8cpu_readEii($this,$622,$83)|0);
      $624 = ($499<<24>>24)==(-102);
      if ($624) {
       $625 = $619 ^ 255;
       $626 = (($625) + 1)|0;
       $627 = $623 ^ 255;
       $hi$0 = $627;$lo$0 = $626;
      } else {
       $hi$0 = $623;$lo$0 = $619;
      }
      $628 = (($lo$0) + ($a$188))|0;
      $629 = (($hi$0) + ($y$169))|0;
      $630 = $628 >> 8;
      $631 = (($629) + ($630))|0;
      $632 = $hi$0 ^ $y$169;
      $633 = $632 ^ $631;
      $634 = $psw$165 & -73;
      $635 = $633 >>> 1;
      $636 = $635 & 8;
      $637 = $636 | $634;
      $638 = (($633) + 128)|0;
      $639 = $638 >>> 2;
      $640 = $639 & 64;
      $641 = $637 | $640;
      $642 = $628 & 255;
      $643 = $631 & 255;
      $644 = $628 >>> 1;
      $645 = $644 | $628;
      $646 = $645 & 127;
      $647 = $646 | $643;
      $a$0 = $642;$c$0 = $631;$nz$0 = $647;$pc$1 = $73;$psw$0 = $641;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $643;
      label = 6;
      break;
     }
     case 158:  {
      $671 = $y$169 << 8;
      $672 = (($a$188) + ($671))|0;
      $673 = $psw$165 & -73;
      $674 = ($y$169|0)<($x$175|0);
      $675 = $673 | 64;
      $$ = $674 ? $673 : $675;
      $676 = $y$169 & 15;
      $677 = $x$175 & 15;
      $678 = ($676>>>0)<($677>>>0);
      $679 = $$ | 8;
      $psw$3 = $678 ? $$ : $679;
      $680 = $x$175 << 1;
      $681 = ($y$169|0)<($680|0);
      if ($681) {
       $682 = (($672>>>0) / ($x$175>>>0))&-1;
       $683 = Math_imul($682, $x$175)|0;
       $684 = (($672) - ($683))|0;
       $a$2 = $682;$y$2 = $684;
      } else {
       $685 = $x$175 << 9;
       $686 = (($672) - ($685))|0;
       $687 = (256 - ($x$175))|0;
       $688 = (($686>>>0) / ($687>>>0))&-1;
       $689 = (255 - ($688))|0;
       $690 = (($686>>>0) % ($687>>>0))&-1;
       $691 = (($690) + ($x$175))|0;
       $a$2 = $689;$y$2 = $691;
      }
      $692 = $a$2 & 255;
      $a$1$be = $692;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $692;$pc$2$be = $73;$psw$1$be = $psw$3;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$2;
      break;
     }
     case 223:  {
      $693 = ($a$188|0)>(153);
      if ($693) {
       label = 214;
      } else {
       $694 = $c$163 & 256;
       $695 = ($694|0)==(0);
       if ($695) {
        $a$3 = $a$188;$c$12 = $c$163;
       } else {
        label = 214;
       }
      }
      if ((label|0) == 214) {
       label = 0;
       $696 = (($a$188) + 96)|0;
       $a$3 = $696;$c$12 = 256;
      }
      $697 = $a$3 & 14;
      $698 = ($697>>>0)>(9);
      if ($698) {
       label = 217;
      } else {
       $699 = $psw$165 & 8;
       $700 = ($699|0)==(0);
       if ($700) {
        $a$4 = $a$3;
       } else {
        label = 217;
       }
      }
      if ((label|0) == 217) {
       label = 0;
       $701 = (($a$3) + 6)|0;
       $a$4 = $701;
      }
      $702 = $a$4 & 255;
      $a$1$be = $702;$c$1$be = $c$12;$dp$0$be = $dp$060;$nz$1$be = $a$4;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 90:  {
      $648 = $75 | $dp$060;
      $649 = (($83) + -1)|0;
      $650 = (__ZN8SNES_SPC8cpu_readEii($this,$648,$649)|0);
      $651 = (($a$188) - ($650))|0;
      $652 = $651 >>> 1;
      $653 = $652 | $651;
      $654 = $653 & 127;
      $655 = $651 >> 8;
      $656 = (($75) + 1)|0;
      $657 = $656 & 255;
      $658 = $657 | $dp$060;
      $659 = (__ZN8SNES_SPC8cpu_readEii($this,$658,$83)|0);
      $660 = (($y$169) - ($659))|0;
      $661 = (($660) + ($655))|0;
      $662 = $661 ^ -1;
      $$masked = $661 & 255;
      $663 = $654 | $$masked;
      $a$0 = $a$188;$c$0 = $662;$nz$0 = $663;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 207:  {
      $664 = Math_imul($a$188, $y$169)|0;
      $665 = $664 & 255;
      $666 = $664 >>> 1;
      $667 = $666 | $664;
      $668 = $667 & 127;
      $669 = $664 >>> 8;
      $670 = $668 | $669;
      $a$1$be = $665;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $670;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $669;
      break;
     }
     case 190:  {
      $703 = ($a$188|0)>(153);
      if ($703) {
       label = 221;
      } else {
       $704 = $c$163 & 256;
       $705 = ($704|0)==(0);
       if ($705) {
        label = 221;
       } else {
        $a$5 = $a$188;$c$13 = $c$163;
       }
      }
      if ((label|0) == 221) {
       label = 0;
       $706 = (($a$188) + -96)|0;
       $a$5 = $706;$c$13 = 0;
      }
      $707 = $a$5 & 14;
      $708 = ($707>>>0)>(9);
      if ($708) {
       label = 224;
      } else {
       $709 = $psw$165 & 8;
       $710 = ($709|0)==(0);
       if ($710) {
        label = 224;
       } else {
        $a$6 = $a$5;
       }
      }
      if ((label|0) == 224) {
       label = 0;
       $711 = (($a$5) + -6)|0;
       $a$6 = $711;
      }
      $712 = $a$6 & 255;
      $a$1$be = $712;$c$1$be = $c$13;$dp$0$be = $dp$060;$nz$1$be = $a$6;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 47:  {
      $713 = $74 << 24 >> 24;
      $$sum15 = (($713) + 1)|0;
      $714 = (($pc$268) + ($$sum15)|0);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $714;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 48:  {
      $715 = $74 << 24 >> 24;
      $$sum13 = (($715) + 2)|0;
      $716 = (($pc$268) + ($$sum13)|0);
      $717 = $nz$161 & 2176;
      $718 = ($717|0)==(0);
      if ($718) {
       $719 = (($pc$268) + 2|0);
       $720 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $719;$psw$1$be = $psw$165;$rel_time$1$be = $720;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $716;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 16:  {
      $721 = $74 << 24 >> 24;
      $$sum11 = (($721) + 2)|0;
      $722 = (($pc$268) + ($$sum11)|0);
      $723 = $nz$161 & 2176;
      $724 = ($723|0)==(0);
      if ($724) {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $722;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $725 = (($pc$268) + 2|0);
       $726 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $725;$psw$1$be = $psw$165;$rel_time$1$be = $726;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 176:  {
      $727 = $74 << 24 >> 24;
      $$sum9 = (($727) + 2)|0;
      $728 = (($pc$268) + ($$sum9)|0);
      $729 = $c$163 & 256;
      $730 = ($729|0)==(0);
      if ($730) {
       $731 = (($pc$268) + 2|0);
       $732 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $731;$psw$1$be = $psw$165;$rel_time$1$be = $732;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $728;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 144:  {
      $733 = $74 << 24 >> 24;
      $$sum7 = (($733) + 2)|0;
      $734 = (($pc$268) + ($$sum7)|0);
      $735 = $c$163 & 256;
      $736 = ($735|0)==(0);
      if ($736) {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $734;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $737 = (($pc$268) + 2|0);
       $738 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $737;$psw$1$be = $psw$165;$rel_time$1$be = $738;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 112:  {
      $739 = $74 << 24 >> 24;
      $$sum5 = (($739) + 2)|0;
      $740 = (($pc$268) + ($$sum5)|0);
      $741 = $psw$165 & 64;
      $742 = ($741|0)==(0);
      if ($742) {
       $743 = (($pc$268) + 2|0);
       $744 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $743;$psw$1$be = $psw$165;$rel_time$1$be = $744;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $740;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 80:  {
      $745 = $74 << 24 >> 24;
      $$sum3 = (($745) + 2)|0;
      $746 = (($pc$268) + ($$sum3)|0);
      $747 = $psw$165 & 64;
      $748 = ($747|0)==(0);
      if ($748) {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $746;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $749 = (($pc$268) + 2|0);
       $750 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $749;$psw$1$be = $psw$165;$rel_time$1$be = $750;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 243: case 211: case 179: case 147: case 115: case 83: case 51: case 19:  {
      $760 = (($pc$268) + 2|0);
      $761 = $75 | $dp$060;
      $762 = (($83) + -4)|0;
      $763 = (__ZN8SNES_SPC8cpu_readEii($this,$761,$762)|0);
      $764 = $76 >>> 5;
      $765 = 1 << $764;
      $766 = $763 & $765;
      $767 = ($766|0)==(0);
      if ($767) {
       $pc$0 = $760;
       label = 5;
      } else {
       $768 = (($83) + -2)|0;
       $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $760;$psw$0 = $psw$165;$rel_time$0 = $768;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
      }
      break;
     }
     case 222:  {
      $769 = (($75) + ($x$175))|0;
      $770 = $769 & 255;
      $data$51 = $770;
      label = 244;
      break;
     }
     case 46:  {
      $data$51 = $75;
      label = 244;
      break;
     }
     case 227: case 195: case 163: case 131: case 99: case 67: case 35: case 3:  {
      $751 = (($pc$268) + 2|0);
      $752 = $75 | $dp$060;
      $753 = (($83) + -4)|0;
      $754 = (__ZN8SNES_SPC8cpu_readEii($this,$752,$753)|0);
      $755 = $76 >>> 5;
      $756 = 1 << $755;
      $757 = $754 & $756;
      $758 = ($757|0)==(0);
      if ($758) {
       $759 = (($83) + -2)|0;
       $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $751;$psw$0 = $psw$165;$rel_time$0 = $759;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
      } else {
       $pc$0 = $751;
       label = 5;
      }
      break;
     }
     case 110:  {
      $790 = $75 | $dp$060;
      $791 = (($83) + -4)|0;
      $792 = (__ZN8SNES_SPC8cpu_readEii($this,$790,$791)|0);
      $793 = (($792) + 8191)|0;
      $794 = (($83) + -3)|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$793,$790,$794);
      $795 = (($pc$268) + 2|0);
      $796 = ($792|0)==(1);
      if ($796) {
       $797 = (($83) + -2)|0;
       $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $795;$psw$0 = $psw$165;$rel_time$0 = $797;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
      } else {
       $pc$0 = $795;
       label = 5;
      }
      break;
     }
     case 254:  {
      $798 = (($y$169) + 255)|0;
      $799 = $798 & 255;
      $800 = $74 << 24 >> 24;
      $$sum1 = (($800) + 2)|0;
      $801 = (($pc$268) + ($$sum1)|0);
      $802 = ($799|0)==(0);
      if ($802) {
       $803 = (($pc$268) + 2|0);
       $804 = (($83) + -2)|0;
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $803;$psw$1$be = $psw$165;$rel_time$1$be = $804;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = 0;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $801;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $799;
      }
      break;
     }
     case 95:  {
      $pc$28 = $73;
      label = 257;
      break;
     }
     case 15:  {
      $810 = $73;
      $811 = (($810) - ($49))|0;
      $812 = (__Z8get_le16PKv($50)|0);
      $813 = ((($this) + ($812)|0) + 2716|0);
      $814 = (($sp$067) + -2|0);
      $815 = $814;
      $816 = (($815) - ($49))|0;
      $817 = ($816|0)>(256);
      if ($817) {
       __Z8set_le16Pvj($814,$811);
       $sp$1 = $814;
      } else {
       $818 = $811&255;
       $819 = $816 & 255;
       $820 = $819 | 256;
       $821 = ((($this) + ($820)|0) + 2716|0);
       HEAP8[$821>>0] = $818;
       $822 = $811 >>> 8;
       $823 = $822&255;
       $824 = (($sp$067) + -1|0);
       HEAP8[$824>>0] = $823;
       $825 = (($sp$067) + 254|0);
       $sp$1 = $825;
      }
      $826 = $psw$165 & -164;
      $827 = $c$163 >>> 8;
      $828 = $827 & 1;
      $829 = $dp$060 >>> 3;
      $830 = $nz$161 >>> 4;
      $831 = $830 | $nz$161;
      $832 = $831 & 128;
      $833 = $828 | $829;
      $834 = $833 | $826;
      $835 = $834 | $832;
      $836 = $nz$161&255;
      $837 = ($836<<24>>24)==(0);
      $838 = $835 | 2;
      $$21 = $837 ? $838 : $835;
      $839 = $psw$165 & -21;
      $840 = $839 | 16;
      $841 = $$21&255;
      $842 = (($sp$1) + -1|0);
      HEAP8[$842>>0] = $841;
      $843 = $842;
      $844 = (($843) - ($49))|0;
      $845 = ($844|0)==(256);
      $846 = (($sp$1) + 255|0);
      $$29 = $845 ? $846 : $842;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $813;$psw$1$be = $840;$rel_time$1$be = $83;$sp$0$be = $$29;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 31:  {
      $805 = (__Z8get_le16PKv($73)|0);
      $806 = (($805) + ($x$175))|0;
      $807 = ((($this) + ($806)|0) + 2716|0);
      $pc$28 = $807;
      label = 257;
      break;
     }
     case 241: case 225: case 209: case 193: case 177: case 161: case 145: case 129: case 113: case 97: case 81: case 65: case 49: case 33: case 17: case 1:  {
      $864 = $73;
      $865 = (($864) - ($52))|0;
      $866 = $76 >>> 3;
      $867 = (65502 - ($866))|0;
      $868 = ((($this) + ($867)|0) + 2716|0);
      $869 = (__Z8get_le16PKv($868)|0);
      $870 = ((($this) + ($869)|0) + 2716|0);
      $871 = (($sp$067) + -2|0);
      $872 = $871;
      $873 = (($872) - ($52))|0;
      $874 = ($873|0)>(256);
      if ($874) {
       __Z8set_le16Pvj($871,$865);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $870;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $871;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      } else {
       $875 = $865&255;
       $876 = $873 & 255;
       $877 = $876 | 256;
       $878 = ((($this) + ($877)|0) + 2716|0);
       HEAP8[$878>>0] = $875;
       $879 = $865 >>> 8;
       $880 = $879&255;
       $881 = (($sp$067) + -1|0);
       HEAP8[$881>>0] = $880;
       $882 = (($sp$067) + 254|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $870;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $882;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      }
      break;
     }
     case 79:  {
      $847 = $73;
      $848 = (($847) - ($51))|0;
      $849 = (($848) + 1)|0;
      $850 = $75 | 65280;
      $851 = ((($this) + ($850)|0) + 2716|0);
      $852 = (($sp$067) + -2|0);
      $853 = $852;
      $854 = (($853) - ($51))|0;
      $855 = ($854|0)>(256);
      if ($855) {
       __Z8set_le16Pvj($852,$849);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $851;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $852;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      } else {
       $856 = $849&255;
       $857 = $854 & 255;
       $858 = $857 | 256;
       $859 = ((($this) + ($858)|0) + 2716|0);
       HEAP8[$859>>0] = $856;
       $860 = $849 >>> 8;
       $861 = $860&255;
       $862 = (($sp$067) + -1|0);
       HEAP8[$862>>0] = $861;
       $863 = (($sp$067) + 254|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $851;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $863;$x$1$be = $x$175;$y$1$be = $y$169;
       break L8;
      }
      break;
     }
     case 13:  {
      $907 = $psw$165 & -164;
      $908 = $c$163 >>> 8;
      $909 = $908 & 1;
      $910 = $dp$060 >>> 3;
      $911 = $nz$161 >>> 4;
      $912 = $911 | $nz$161;
      $913 = $912 & 128;
      $914 = $909 | $910;
      $915 = $914 | $907;
      $916 = $915 | $913;
      $917 = $nz$161&255;
      $918 = ($917<<24>>24)==(0);
      $919 = $916 | 2;
      $$22 = $918 ? $919 : $916;
      $920 = $$22&255;
      $921 = (($sp$067) + -1|0);
      HEAP8[$921>>0] = $920;
      $922 = $921;
      $923 = (($922) - ($54))|0;
      $924 = ($923|0)==(256);
      $925 = (($sp$067) + 255|0);
      $$30 = $924 ? $925 : $921;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $$30;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 45:  {
      $926 = $a$188&255;
      $927 = (($sp$067) + -1|0);
      HEAP8[$927>>0] = $926;
      $928 = $927;
      $929 = (($928) - ($55))|0;
      $930 = ($929|0)==(256);
      $931 = (($sp$067) + 255|0);
      $$23 = $930 ? $931 : $927;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $$23;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 127:  {
      $883 = HEAP8[$sp$067>>0]|0;
      $884 = $883&255;
      $885 = (($sp$067) + 1|0);
      $886 = (__Z8get_le16PKv($885)|0);
      $887 = ((($this) + ($886)|0) + 2716|0);
      $888 = (($sp$067) + 3|0);
      $pc$29 = $887;$sp$2 = $888;$temp53$0 = $884;
      label = 271;
      break;
     }
     case 142:  {
      $889 = (($sp$067) + 1|0);
      $890 = HEAP8[$sp$067>>0]|0;
      $891 = $890&255;
      $892 = $889;
      $893 = (($892) - ($53))|0;
      $894 = ($893|0)==(513);
      if ($894) {
       $895 = (($sp$067) + -256|0);
       $896 = HEAP8[$895>>0]|0;
       $897 = $896&255;
       $898 = (($sp$067) + -255|0);
       $pc$29 = $73;$sp$2 = $898;$temp53$0 = $897;
       label = 271;
      } else {
       $pc$29 = $73;$sp$2 = $889;$temp53$0 = $891;
       label = 271;
      }
      break;
     }
     case 74:  {
      $994 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$83)|0);
      $995 = $994 & $c$163;
      $996 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $995;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $996;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 106:  {
      $997 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$83)|0);
      $998 = $997 ^ -1;
      $999 = $c$163 & $998;
      $1000 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $999;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1000;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 10:  {
      $1001 = (($83) + -1)|0;
      $1002 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$1001)|0);
      $1003 = $1002 | $c$163;
      $1004 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $1003;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1004;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 42:  {
      $1005 = (($83) + -1)|0;
      $1006 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$1005)|0);
      $1007 = $1006 ^ -1;
      $1008 = $c$163 | $1007;
      $1009 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $1008;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1009;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 138:  {
      $1010 = (($83) + -1)|0;
      $1011 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$1010)|0);
      $1012 = $1011 ^ $c$163;
      $1013 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $1012;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1013;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 77:  {
      $932 = $x$175&255;
      $933 = (($sp$067) + -1|0);
      HEAP8[$933>>0] = $932;
      $934 = $933;
      $935 = (($934) - ($56))|0;
      $936 = ($935|0)==(256);
      $937 = (($sp$067) + 255|0);
      $$24 = $936 ? $937 : $933;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $$24;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 109:  {
      $938 = $y$169&255;
      $939 = (($sp$067) + -1|0);
      HEAP8[$939>>0] = $938;
      $940 = $939;
      $941 = (($940) - ($57))|0;
      $942 = ($941|0)==(256);
      $943 = (($sp$067) + 255|0);
      $$25 = $942 ? $943 : $939;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $$25;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 174:  {
      $944 = (($sp$067) + 1|0);
      $945 = HEAP8[$sp$067>>0]|0;
      $946 = $945&255;
      $947 = $944;
      $948 = (($947) - ($58))|0;
      $949 = ($948|0)==(513);
      if ($949) {
       $950 = (($sp$067) + -256|0);
       $951 = HEAP8[$950>>0]|0;
       $952 = $951&255;
       $953 = (($sp$067) + -255|0);
       $a$1$be = $952;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $953;$x$1$be = $x$175;$y$1$be = $y$169;
      } else {
       $a$1$be = $946;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $944;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 206:  {
      $954 = (($sp$067) + 1|0);
      $955 = HEAP8[$sp$067>>0]|0;
      $956 = $955&255;
      $957 = $954;
      $958 = (($957) - ($59))|0;
      $959 = ($958|0)==(513);
      if ($959) {
       $960 = (($sp$067) + -256|0);
       $961 = HEAP8[$960>>0]|0;
       $962 = $961&255;
       $963 = (($sp$067) + -255|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $963;$x$1$be = $962;$y$1$be = $y$169;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $954;$x$1$be = $956;$y$1$be = $y$169;
      }
      break;
     }
     case 238:  {
      $964 = (($sp$067) + 1|0);
      $965 = HEAP8[$sp$067>>0]|0;
      $966 = $965&255;
      $967 = $964;
      $968 = (($967) - ($60))|0;
      $969 = ($968|0)==(513);
      if ($969) {
       $970 = (($sp$067) + -256|0);
       $971 = HEAP8[$970>>0]|0;
       $972 = $971&255;
       $973 = (($sp$067) + -255|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $973;$x$1$be = $x$175;$y$1$be = $972;
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $964;$x$1$be = $x$175;$y$1$be = $966;
      }
      break;
     }
     case 242: case 210: case 178: case 146: case 114: case 82: case 50: case 18: case 226: case 194: case 162: case 130: case 98: case 66: case 34: case 2:  {
      $974 = $76 >>> 5;
      $975 = 1 << $974;
      $976 = $975 ^ -1;
      $977 = $76 & 16;
      $978 = ($977|0)==(0);
      $$26 = $978 ? $975 : 0;
      $979 = $75 | $dp$060;
      $980 = (($83) + -1)|0;
      $981 = (__ZN8SNES_SPC8cpu_readEii($this,$979,$980)|0);
      $982 = $981 & $976;
      $983 = $982 | $$26;
      __ZN8SNES_SPC9cpu_writeEiii($this,$983,$979,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 78: case 14:  {
      $984 = (__Z8get_le16PKv($73)|0);
      $985 = (($pc$268) + 3|0);
      $986 = (($83) + -2)|0;
      $987 = (__ZN8SNES_SPC8cpu_readEii($this,$984,$986)|0);
      $988 = (($a$188) - ($987))|0;
      $989 = $988 & 255;
      $990 = $a$188 ^ -1;
      $991 = $987 & $990;
      $992 = ($499<<24>>24)==(14);
      $993 = $992 ? $a$188 : 0;
      $$27 = $991 | $993;
      __ZN8SNES_SPC9cpu_writeEiii($this,$$27,$984,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $989;$pc$2$be = $985;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 202:  {
      $1022 = (__Z8get_le16PKv($73)|0);
      $1023 = (($pc$268) + 3|0);
      $1024 = $1022 & 8191;
      $1025 = (($83) + -2)|0;
      $1026 = (__ZN8SNES_SPC8cpu_readEii($this,$1024,$1025)|0);
      $1027 = $1022 >>> 13;
      $1028 = 1 << $1027;
      $1029 = $1028 ^ -1;
      $1030 = $1026 & $1029;
      $1031 = $c$163 >>> 8;
      $1032 = $1031 & 1;
      $1033 = $1032 << $1027;
      $1034 = $1030 | $1033;
      $1035 = (($1034) + 8192)|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$1035,$1024,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1023;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 170:  {
      $1036 = (__ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$73,$83)|0);
      $1037 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $1036;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1037;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 96:  {
      $a$1$be = $a$188;$c$1$be = 0;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 128:  {
      $a$1$be = $a$188;$c$1$be = -1;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 237:  {
      $1038 = $c$163 ^ 256;
      $a$1$be = $a$188;$c$1$be = $1038;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 224:  {
      $1039 = $psw$165 & -73;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $1039;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 32:  {
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = 0;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 64:  {
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = 256;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 160:  {
      $1040 = $psw$165 | 4;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $1040;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 192:  {
      $1041 = $psw$165 & -5;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $73;$psw$1$be = $1041;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 234:  {
      $1014 = (__Z8get_le16PKv($73)|0);
      $1015 = (($pc$268) + 3|0);
      $1016 = $1014 & 8191;
      $1017 = (($83) + -1)|0;
      $1018 = (__ZN8SNES_SPC8cpu_readEii($this,$1016,$1017)|0);
      $1019 = $1014 >>> 13;
      $1020 = 1 << $1019;
      $1021 = $1020 ^ $1018;
      __ZN8SNES_SPC9cpu_writeEiii($this,$1021,$1016,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1015;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 239:  {
      label = 302;
      break L6;
      break;
     }
     case 255:  {
      $1042 = $73;
      $1043 = (($1042) - ($61))|0;
      $1044 = (($1043) + -1)|0;
      $1045 = ($1044>>>0)>(65535);
      if (!($1045)) {
       label = 302;
       break L6;
      }
      $1046 = $1044 & 65535;
      $1047 = ((($this) + ($1046)|0) + 2716|0);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $1047;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     default: {
      label = 303;
      break L6;
     }
     }
    } while(0);
    switch (label|0) {
     case 31: {
      label = 0;
      $158 = (($pc$268) + 2|0);
      $159 = HEAP8[$158>>0]|0;
      $160 = $159&255;
      $161 = (($pc$268) + 3|0);
      $162 = $160 | $dp$060;
      $163 = $data$0&255;
      $164 = ((($this) + ($162)|0) + 2716|0);
      HEAP8[$164>>0] = $163;
      $165 = (($162) + -240)|0;
      $166 = ($165>>>0)<(16);
      if ($166) {
       $167 = ((($this) + ($165)|0) + 1940|0);
       HEAP8[$167>>0] = $163;
       $168 = -788594688 << $165;
       $169 = ($168|0)<(0);
       if ($169) {
        __ZN8SNES_SPC17cpu_write_smp_regEiii($this,$data$0,$83,$165);
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $161;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
       } else {
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $161;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
       }
      } else {
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $161;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      }
      break;
     }
     case 44: {
      label = 0;
      $192 = (($pc$268) + 2|0);
      $193 = HEAP8[$192>>0]|0;
      $194 = $193&255;
      $195 = $194 << 8;
      $196 = (($195) + ($data$1))|0;
      $data$2 = $196;$pc$3 = $192;
      label = 46;
      break;
     }
     case 49: {
      label = 0;
      $208 = $data$3 | $dp$060;
      $209 = (($208) + -253)|0;
      $210 = ($209>>>0)<(3);
      if (!($210)) {
       $217 = ((($this) + ($208)|0) + 2716|0);
       $218 = HEAP8[$217>>0]|0;
       $219 = $218&255;
       $220 = (($208) + -240)|0;
       $221 = ($220>>>0)<(16);
       if (!($221)) {
        $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $219;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $219;$y$0 = $y$169;
        label = 6;
        break;
       }
       $222 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$220,$83)|0);
       $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $222;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $222;$y$0 = $y$169;
       label = 6;
       break;
      }
      $211 = ((($this) + (($209*24)|0)|0) + 1868|0);
      $212 = HEAP32[$211>>2]|0;
      $213 = ($83|0)<($212|0);
      if ($213) {
       $t14$0 = $211;
      } else {
       $214 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$211,$83)|0);
       $t14$0 = $214;
      }
      $215 = (($t14$0) + 20|0);
      $216 = HEAP32[$215>>2]|0;
      HEAP32[$215>>2] = 0;
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $216;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $216;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 56: {
      label = 0;
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $data$4;$pc$1 = $pc$4;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $data$4;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 58: {
      label = 0;
      $228 = (($pc$268) + 2|0);
      $229 = $data$5 | $dp$060;
      $230 = (($229) + -253)|0;
      $231 = ($230>>>0)<(3);
      if (!($231)) {
       $238 = ((($this) + ($229)|0) + 2716|0);
       $239 = HEAP8[$238>>0]|0;
       $240 = $239&255;
       $241 = (($229) + -240)|0;
       $242 = ($241>>>0)<(16);
       if (!($242)) {
        $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $240;$pc$2$be = $228;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $240;
        break;
       }
       $243 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$241,$83)|0);
       $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $243;$pc$2$be = $228;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $243;
       break;
      }
      $232 = ((($this) + (($230*24)|0)|0) + 1868|0);
      $233 = HEAP32[$232>>2]|0;
      $234 = ($83|0)<($233|0);
      if ($234) {
       $t19$0 = $232;
      } else {
       $235 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$232,$83)|0);
       $t19$0 = $235;
      }
      $236 = (($t19$0) + 20|0);
      $237 = HEAP32[$236>>2]|0;
      HEAP32[$236>>2] = 0;
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $237;$pc$2$be = $228;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $237;
      break;
     }
     case 76: {
      label = 0;
      $272 = (($pc$268) + 2|0);
      $273 = HEAP8[$272>>0]|0;
      $274 = $273&255;
      $275 = $274 << 8;
      $276 = (($275) + ($data$6))|0;
      $data$7 = $276;$pc$5 = $272;
      label = 78;
      break;
     }
     case 80: {
      label = 0;
      $280 = (__Z8get_le16PKv($73)|0);
      __ZN8SNES_SPC9cpu_writeEiii($this,$temp27$0,$280,$83);
      $281 = (($pc$268) + 3|0);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $281;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 82: {
      label = 0;
      $284 = $data$8 | $dp$060;
      __ZN8SNES_SPC9cpu_writeEiii($this,$x$175,$284,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 84: {
      label = 0;
      $287 = $data$9 | $dp$060;
      __ZN8SNES_SPC9cpu_writeEiii($this,$y$169,$287,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $73;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 97: {
      label = 0;
      $307 = (($pc$268) + 2|0);
      $308 = HEAP8[$307>>0]|0;
      $309 = $308&255;
      $310 = $309 << 8;
      $311 = (($310) + ($data$10))|0;
      $data$12 = $311;$pc$6 = $307;
      label = 100;
      break;
     }
     case 99: {
      label = 0;
      $314 = $data$11 | $dp$060;
      $data$12 = $314;$pc$6 = $73;
      label = 100;
      break;
     }
     case 104: {
      label = 0;
      $324 = (($pc$268) + 2|0);
      $325 = (($pc$268) + 3|0);
      $326 = HEAP8[$324>>0]|0;
      $327 = $326&255;
      $328 = $327 | $dp$060;
      $addr28$0 = $328;$data$15 = $data$14;$pc$8 = $325;
      label = 105;
      break;
     }
     case 111: {
      label = 0;
      $344 = (($pc$268) + 2|0);
      $345 = HEAP8[$344>>0]|0;
      $346 = $345&255;
      $347 = $346 << 8;
      $348 = (($347) + ($data$16))|0;
      $data$18 = $348;$pc$9 = $344;
      label = 114;
      break;
     }
     case 113: {
      label = 0;
      $351 = $data$17 | $dp$060;
      $data$18 = $351;$pc$9 = $73;
      label = 114;
      break;
     }
     case 118: {
      label = 0;
      $361 = (($pc$268) + 2|0);
      $362 = (($pc$268) + 3|0);
      $363 = HEAP8[$361>>0]|0;
      $364 = $363&255;
      $365 = $364 | $dp$060;
      $addr29$0 = $365;$data$21 = $data$20;$pc$11 = $362;
      label = 119;
      break;
     }
     case 125: {
      label = 0;
      $381 = (($pc$268) + 2|0);
      $382 = HEAP8[$381>>0]|0;
      $383 = $382&255;
      $384 = $383 << 8;
      $385 = (($384) + ($data$22))|0;
      $data$24 = $385;$pc$12 = $381;
      label = 128;
      break;
     }
     case 127: {
      label = 0;
      $388 = $data$23 | $dp$060;
      $data$24 = $388;$pc$12 = $73;
      label = 128;
      break;
     }
     case 132: {
      label = 0;
      $398 = (($pc$268) + 2|0);
      $399 = (($pc$268) + 3|0);
      $400 = HEAP8[$398>>0]|0;
      $401 = $400&255;
      $402 = $401 | $dp$060;
      $addr31$0 = $402;$data$27 = $data$26;$pc$14 = $399;
      label = 133;
      break;
     }
     case 139: {
      label = 0;
      $418 = (($pc$268) + 2|0);
      $419 = HEAP8[$418>>0]|0;
      $420 = $419&255;
      $421 = $420 << 8;
      $422 = (($421) + ($data$28))|0;
      $data$30 = $422;$pc$15 = $418;
      label = 142;
      break;
     }
     case 141: {
      label = 0;
      $425 = $data$29 | $dp$060;
      $data$30 = $425;$pc$15 = $73;
      label = 142;
      break;
     }
     case 146: {
      label = 0;
      $442 = (($pc$268) + 2|0);
      $443 = HEAP8[$442>>0]|0;
      $444 = $443&255;
      $445 = $444 | $dp$060;
      $446 = (($83) + -1)|0;
      $447 = (__ZN8SNES_SPC8cpu_readEii($this,$445,$446)|0);
      $448 = (($447) - ($data$32))|0;
      $449 = $448 ^ -1;
      $450 = $448 & 255;
      $a$0 = $a$188;$c$0 = $449;$nz$0 = $450;$pc$1 = $442;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 149: {
      label = 0;
      $454 = (__ZN8SNES_SPC8cpu_readEii($this,$data$33,$83)|0);
      $data$34 = $454;$pc$18 = $pc$17;
      label = 150;
      break;
     }
     case 153: {
      label = 0;
      $461 = (__ZN8SNES_SPC8cpu_readEii($this,$data$35,$83)|0);
      $data$36 = $461;$pc$20 = $pc$19;
      label = 154;
      break;
     }
     case 157: {
      label = 0;
      $472 = (($pc$268) + 2|0);
      $473 = HEAP8[$472>>0]|0;
      $474 = $473&255;
      $475 = $474 | $dp$060;
      $addr33$0 = $475;$data$38 = $data$37;$pc$21 = $472;
      label = 158;
      break;
     }
     case 164: {
      label = 0;
      $490 = (($pc$268) + 2|0);
      $491 = HEAP8[$490>>0]|0;
      $492 = $491&255;
      $493 = $492 << 8;
      $494 = (($493) + ($data$39))|0;
      $data$41 = $494;$pc$22 = $490;
      label = 167;
      break;
     }
     case 166: {
      label = 0;
      $497 = $data$40 | $dp$060;
      $data$41 = $497;$pc$22 = $73;
      label = 167;
      break;
     }
     case 178: {
      label = 0;
      $532 = $data$45 | $dp$060;
      $data$46 = $532;$pc$25 = $73;
      label = 180;
      break;
     }
     case 182: {
      label = 0;
      $541 = $c$2 >>> 1;
      $542 = $541 & 128;
      $543 = $a$188 >> 1;
      $544 = $542 | $543;
      $545 = $a$188 << 8;
      $a$1$be = $544;$c$1$be = $545;$dp$0$be = $dp$060;$nz$1$be = $544;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 184: {
      label = 0;
      $546 = $c$3 >>> 8;
      $547 = $546 & 1;
      $548 = $a$188 << 1;
      $549 = $547 | $548;
      $550 = $549 & 255;
      $a$1$be = $550;$c$1$be = $548;$dp$0$be = $dp$060;$nz$1$be = $549;$pc$2$be = $73;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 187: {
      label = 0;
      $552 = (($75) + ($x$175))|0;
      $553 = $552 & 255;
      $c$5 = $c$4;$data$47 = $553;
      label = 188;
      break;
     }
     case 190: {
      label = 0;
      $555 = (__Z8get_le16PKv($73)|0);
      $556 = (($pc$268) + 2|0);
      $c$7 = $c$6;$data$48 = $555;$pc$26 = $556;
      label = 191;
      break;
     }
     case 194: {
      label = 0;
      $564 = (($75) + ($x$175))|0;
      $565 = $564 & 255;
      $c$9 = $c$8;$data$49 = $565;
      label = 195;
      break;
     }
     case 197: {
      label = 0;
      $567 = (__Z8get_le16PKv($73)|0);
      $568 = (($pc$268) + 2|0);
      $c$11 = $c$10;$data$50 = $567;$pc$27 = $568;
      label = 198;
      break;
     }
     case 244: {
      label = 0;
      $771 = (($83) + -4)|0;
      $772 = $data$51 | $dp$060;
      $773 = (($772) + -253)|0;
      $774 = ($773>>>0)<(3);
      if ($774) {
       $775 = ((($this) + (($773*24)|0)|0) + 1868|0);
       $776 = HEAP32[$775>>2]|0;
       $777 = ($771|0)<($776|0);
       if ($777) {
        $t44$0 = $775;
       } else {
        $778 = (__ZN8SNES_SPC10run_timer_EPNS_5TimerEi(0,$775,$771)|0);
        $t44$0 = $778;
       }
       $779 = (($t44$0) + 20|0);
       $780 = HEAP32[$779>>2]|0;
       HEAP32[$779>>2] = 0;
       $temp40$0 = $780;
      } else {
       $781 = ((($this) + ($772)|0) + 2716|0);
       $782 = HEAP8[$781>>0]|0;
       $783 = $782&255;
       $784 = (($772) + -240)|0;
       $785 = ($784>>>0)<(16);
       if ($785) {
        $786 = (__ZN8SNES_SPC16cpu_read_smp_regEii($this,$784,$771)|0);
        $temp40$0 = $786;
       } else {
        $temp40$0 = $783;
       }
      }
      $787 = (($pc$268) + 2|0);
      $788 = ($temp40$0|0)==($a$188|0);
      if ($788) {
       $789 = (($83) + -2)|0;
       $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $787;$psw$0 = $psw$165;$rel_time$0 = $789;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
      } else {
       $pc$0 = $787;
       label = 5;
      }
      break;
     }
     case 257: {
      label = 0;
      $808 = (__Z8get_le16PKv($pc$28)|0);
      $809 = ((($this) + ($808)|0) + 2716|0);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $nz$161;$pc$2$be = $809;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 271: {
      label = 0;
      $899 = $temp53$0 << 8;
      $900 = $temp53$0 << 3;
      $901 = $900 & 256;
      $902 = $temp53$0 << 4;
      $903 = $902 & 2048;
      $904 = $temp53$0 & 2;
      $905 = $903 | $904;
      $906 = $905 ^ 2;
      $a$1$be = $a$188;$c$1$be = $899;$dp$0$be = $901;$nz$1$be = $906;$pc$2$be = $pc$29;$psw$1$be = $temp53$0;$rel_time$1$be = $83;$sp$0$be = $sp$2;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
    }
    switch (label|0) {
     case 5: {
      label = 0;
      $62 = HEAP8[$pc$0>>0]|0;
      $63 = $62 << 24 >> 24;
      $64 = (($pc$0) + ($63)|0);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $64;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 46: {
      label = 0;
      $200 = (__ZN8SNES_SPC8cpu_readEii($this,$data$2,$83)|0);
      $a$0 = $200;$c$0 = $c$163;$nz$0 = $200;$pc$1 = $pc$3;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 78: {
      label = 0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$a$188,$data$7,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $nz$161;$pc$1 = $pc$5;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 100: {
      label = 0;
      $315 = (__ZN8SNES_SPC8cpu_readEii($this,$data$12,$83)|0);
      $data$13 = $315;$pc$7 = $pc$6;
      label = 101;
      break;
     }
     case 105: {
      label = 0;
      $329 = (($83) + -1)|0;
      $330 = (__ZN8SNES_SPC8cpu_readEii($this,$addr28$0,$329)|0);
      $331 = $330 & $data$15;
      __ZN8SNES_SPC9cpu_writeEiii($this,$331,$addr28$0,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $331;$pc$2$be = $pc$8;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 114: {
      label = 0;
      $352 = (__ZN8SNES_SPC8cpu_readEii($this,$data$18,$83)|0);
      $data$19 = $352;$pc$10 = $pc$9;
      label = 115;
      break;
     }
     case 119: {
      label = 0;
      $366 = (($83) + -1)|0;
      $367 = (__ZN8SNES_SPC8cpu_readEii($this,$addr29$0,$366)|0);
      $368 = $367 | $data$21;
      __ZN8SNES_SPC9cpu_writeEiii($this,$368,$addr29$0,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $368;$pc$2$be = $pc$11;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 128: {
      label = 0;
      $389 = (__ZN8SNES_SPC8cpu_readEii($this,$data$24,$83)|0);
      $data$25 = $389;$pc$13 = $pc$12;
      label = 129;
      break;
     }
     case 133: {
      label = 0;
      $403 = (($83) + -1)|0;
      $404 = (__ZN8SNES_SPC8cpu_readEii($this,$addr31$0,$403)|0);
      $405 = $404 ^ $data$27;
      __ZN8SNES_SPC9cpu_writeEiii($this,$405,$addr31$0,$83);
      $a$1$be = $a$188;$c$1$be = $c$163;$dp$0$be = $dp$060;$nz$1$be = $405;$pc$2$be = $pc$14;$psw$1$be = $psw$165;$rel_time$1$be = $83;$sp$0$be = $sp$067;$x$1$be = $x$175;$y$1$be = $y$169;
      break;
     }
     case 142: {
      label = 0;
      $426 = (__ZN8SNES_SPC8cpu_readEii($this,$data$30,$83)|0);
      $data$31 = $426;$pc$16 = $pc$15;
      label = 143;
      break;
     }
     case 150: {
      label = 0;
      $455 = (($x$175) - ($data$34))|0;
      $456 = $455 ^ -1;
      $457 = $455 & 255;
      $a$0 = $a$188;$c$0 = $456;$nz$0 = $457;$pc$1 = $pc$18;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 154: {
      label = 0;
      $462 = (($y$169) - ($data$36))|0;
      $463 = $462 ^ -1;
      $464 = $462 & 255;
      $a$0 = $a$188;$c$0 = $463;$nz$0 = $464;$pc$1 = $pc$20;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 158: {
      label = 0;
      $476 = (($83) + -1)|0;
      $477 = (__ZN8SNES_SPC8cpu_readEii($this,$addr33$0,$476)|0);
      $addr33$1 = $addr33$0;$data$43 = $data$38;$nz$2 = $477;$pc$24 = $pc$21;
      label = 168;
      break;
     }
     case 167: {
      label = 0;
      $498 = (__ZN8SNES_SPC8cpu_readEii($this,$data$41,$83)|0);
      $addr33$1 = -1;$data$43 = $498;$nz$2 = $a$188;$pc$24 = $pc$22;
      label = 168;
      break;
     }
     case 180: {
      label = 0;
      $535 = $76 >>> 4;
      $536 = $535 & 2;
      $537 = (($536) + -1)|0;
      $538 = (($83) + -1)|0;
      $539 = (__ZN8SNES_SPC8cpu_readEii($this,$data$46,$538)|0);
      $540 = (($537) + ($539))|0;
      __ZN8SNES_SPC9cpu_writeEiii($this,$540,$data$46,$83);
      $a$0 = $a$188;$c$0 = $c$163;$nz$0 = $540;$pc$1 = $pc$25;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
      break;
     }
     case 188: {
      label = 0;
      $554 = $data$47 | $dp$060;
      $c$7 = $c$5;$data$48 = $554;$pc$26 = $73;
      label = 191;
      break;
     }
     case 195: {
      label = 0;
      $566 = $data$49 | $dp$060;
      $c$11 = $c$9;$data$50 = $566;$pc$27 = $73;
      label = 198;
      break;
     }
    }
    do {
     if ((label|0) == 101) {
      label = 0;
      $316 = $data$13 & $a$188;
      $a$0 = $316;$c$0 = $c$163;$nz$0 = $316;$pc$1 = $pc$7;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
     else if ((label|0) == 115) {
      label = 0;
      $353 = $data$19 | $a$188;
      $a$0 = $353;$c$0 = $c$163;$nz$0 = $353;$pc$1 = $pc$10;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
     else if ((label|0) == 129) {
      label = 0;
      $390 = $data$25 ^ $a$188;
      $a$0 = $390;$c$0 = $c$163;$nz$0 = $390;$pc$1 = $pc$13;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
     else if ((label|0) == 143) {
      label = 0;
      $427 = (($a$188) - ($data$31))|0;
      $428 = $427 ^ -1;
      $429 = $427 & 255;
      $a$0 = $a$188;$c$0 = $428;$nz$0 = $429;$pc$1 = $pc$16;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
     else if ((label|0) == 168) {
      label = 0;
      $500 = ($499&255)>(159);
      $501 = $data$43 ^ 255;
      $$data$43 = $500 ? $501 : $data$43;
      $502 = $$data$43 ^ $nz$2;
      $503 = $c$163 >>> 8;
      $504 = $503 & 1;
      $505 = (($nz$2) + ($504))|0;
      $506 = (($505) + ($$data$43))|0;
      $507 = $502 ^ $506;
      $508 = $psw$165 & -73;
      $509 = $507 >>> 1;
      $510 = $509 & 8;
      $511 = $510 | $508;
      $512 = (($507) + 128)|0;
      $513 = $512 >>> 2;
      $514 = $513 & 64;
      $515 = $511 | $514;
      $516 = ($addr33$1|0)<(0);
      if ($516) {
       $517 = $506 & 255;
       $a$0 = $517;$c$0 = $506;$nz$0 = $506;$pc$1 = $pc$24;$psw$0 = $515;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
       break;
      } else {
       __ZN8SNES_SPC9cpu_writeEiii($this,$506,$addr33$1,$83);
       $a$0 = $a$188;$c$0 = $506;$nz$0 = $506;$pc$1 = $pc$24;$psw$0 = $515;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
       label = 6;
       break;
      }
     }
     else if ((label|0) == 191) {
      label = 0;
      $557 = $c$7 >>> 8;
      $558 = $557 & 1;
      $559 = (($83) + -1)|0;
      $560 = (__ZN8SNES_SPC8cpu_readEii($this,$data$48,$559)|0);
      $561 = $560 << 1;
      $562 = $561 | $558;
      __ZN8SNES_SPC9cpu_writeEiii($this,$562,$data$48,$83);
      $a$0 = $a$188;$c$0 = $561;$nz$0 = $562;$pc$1 = $pc$26;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
     else if ((label|0) == 198) {
      label = 0;
      $569 = (($83) + -1)|0;
      $570 = (__ZN8SNES_SPC8cpu_readEii($this,$data$50,$569)|0);
      $571 = $c$11 >>> 1;
      $572 = $571 & 128;
      $573 = $570 >> 1;
      $574 = $573 | $572;
      $575 = $570 << 8;
      __ZN8SNES_SPC9cpu_writeEiii($this,$574,$data$50,$83);
      $a$0 = $a$188;$c$0 = $575;$nz$0 = $574;$pc$1 = $pc$27;$psw$0 = $psw$165;$rel_time$0 = $83;$x$0 = $x$175;$y$0 = $y$169;
      label = 6;
     }
    } while(0);
    if ((label|0) == 6) {
     label = 0;
     $65 = (($pc$1) + 1|0);
     $a$1$be = $a$0;$c$1$be = $c$0;$dp$0$be = $dp$060;$nz$1$be = $nz$0;$pc$2$be = $65;$psw$1$be = $psw$0;$rel_time$1$be = $rel_time$0;$sp$0$be = $sp$067;$x$1$be = $x$0;$y$1$be = $y$0;
    }
    $66 = HEAP8[$pc$2$be>>0]|0;
    $67 = $66&255;
    $68 = ((($this) + ($67)|0) + 2204|0);
    $69 = HEAP8[$68>>0]|0;
    $70 = $69&255;
    $71 = (($70) + ($rel_time$1$be))|0;
    $72 = ($71|0)>(0);
    if ($72) {
     $a$157 = $a$1$be;$c$139 = $c$1$be;$dp$033 = $dp$0$be;$nz$136 = $nz$1$be;$pc$248 = $pc$2$be;$psw$142 = $psw$1$be;$rel_time$2 = $rel_time$1$be;$sp$045 = $sp$0$be;$x$154 = $x$1$be;$y$151 = $y$1$be;
     break L4;
    } else {
     $499 = $66;$76 = $67;$83 = $71;$a$188 = $a$1$be;$c$163 = $c$1$be;$dp$060 = $dp$0$be;$nz$161 = $nz$1$be;$pc$268 = $pc$2$be;$psw$165 = $psw$1$be;$sp$067 = $sp$0$be;$x$175 = $x$1$be;$y$169 = $y$1$be;
    }
   }
   if ((label|0) == 302) {
    $1048 = (($this) + 2020|0);
    HEAP32[$1048>>2] = 584;
    $a$157 = $a$188;$c$139 = $c$163;$dp$033 = $dp$060;$nz$136 = $nz$161;$pc$248 = $pc$268;$psw$142 = $psw$165;$rel_time$2 = 0;$sp$045 = $sp$067;$x$154 = $x$175;$y$151 = $y$169;
    break;
   }
   else if ((label|0) == 303) {
    ___assert_fail((608|0),(552|0),1200,(568|0));
    // unreachable;
   }
  }
 } while(0);
 $1049 = $pc$248;
 $1050 = $16;
 $1051 = (($1049) - ($1050))|0;
 $1052 = $1051 & 65535;
 HEAP32[$23>>2] = $1052;
 $1053 = (($sp$045) + -257|0);
 $1054 = $1053;
 $1055 = (($1054) - ($1050))|0;
 $1056 = $1055 & 255;
 HEAP32[$26>>2] = $1056;
 $1057 = $a$157 & 255;
 HEAP32[$17>>2] = $1057;
 $1058 = $x$154 & 255;
 HEAP32[$19>>2] = $1058;
 $1059 = $y$151 & 255;
 HEAP32[$21>>2] = $1059;
 $1060 = $psw$142 & -164;
 $1061 = $c$139 >>> 8;
 $1062 = $1061 & 1;
 $1063 = $dp$033 >>> 3;
 $1064 = $nz$136 >>> 4;
 $1065 = $1064 | $nz$136;
 $1066 = $1065 & 128;
 $1067 = $1062 | $1063;
 $1068 = $1067 | $1060;
 $1069 = $1068 | $1066;
 $1070 = $nz$136&255;
 $1071 = ($1070<<24>>24)==(0);
 $1072 = $1069 | 2;
 $$28 = $1071 ? $1072 : $1069;
 $1073 = $$28 & 255;
 HEAP32[$29>>2] = $1073;
 $1074 = HEAP32[$0>>2]|0;
 $1075 = (($1074) + ($rel_time$2))|0;
 HEAP32[$0>>2] = $1075;
 $1076 = HEAP32[$4>>2]|0;
 $1077 = (($1076) - ($rel_time$2))|0;
 HEAP32[$4>>2] = $1077;
 $1078 = HEAP32[$7>>2]|0;
 $1079 = (($1078) - ($rel_time$2))|0;
 HEAP32[$7>>2] = $1079;
 $1080 = HEAP32[$10>>2]|0;
 $1081 = (($1080) - ($rel_time$2))|0;
 HEAP32[$10>>2] = $1081;
 $1082 = HEAP32[$13>>2]|0;
 $1083 = (($1082) - ($rel_time$2))|0;
 HEAP32[$13>>2] = $1083;
 $1084 = HEAP32[$0>>2]|0;
 $1085 = ($1084|0)>($end_time|0);
 if ($1085) {
  ___assert_fail((616|0),(552|0),1220,(568|0));
  // unreachable;
 } else {
  $1086 = (($this) + 1944|0);
  STACKTOP = sp;return ($1086|0);
 }
 return 0|0;
}
function __ZN8SNES_SPC11CPU_mem_bitEPKhi($this,$pc,$rel_time) {
 $this = $this|0;
 $pc = $pc|0;
 $rel_time = $rel_time|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__Z8get_le16PKv($pc)|0);
 $1 = $0 & 8191;
 $2 = (__ZN8SNES_SPC8cpu_readEii($this,$1,$rel_time)|0);
 $3 = $0 >>> 13;
 $4 = $2 >>> $3;
 $5 = $4 << 8;
 $6 = $5 & 256;
 STACKTOP = sp;return ($6|0);
}
function __Z8get_le16PKv($p) {
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($p) + 1|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1&255;
 $3 = $2 << 8;
 $4 = HEAP8[$p>>0]|0;
 $5 = $4&255;
 $6 = $3 | $5;
 STACKTOP = sp;return ($6|0);
}
function __Z8set_le16Pvj($p,$n) {
 $p = $p|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $n >>> 8;
 $1 = $0&255;
 $2 = (($p) + 1|0);
 HEAP8[$2>>0] = $1;
 $3 = $n&255;
 HEAP8[$p>>0] = $3;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC4initEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $i$01 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1868|0);
 _memset(($0|0),0,66640)|0;
 $1 = (($this) + 2716|0);
 __ZN7SPC_DSP4initEPv($this,$1);
 $2 = (($this) + 2008|0);
 HEAP32[$2>>2] = 256;
 $3 = (($this) + 2138|0);
 HEAP8[$3>>0] = -1;
 $4 = (($this) + 2139|0);
 HEAP8[$4>>0] = -64;
 $i$01 = 0;
 while(1) {
  $5 = (640 + ($i$01)|0);
  $6 = HEAP8[$5>>0]|0;
  $7 = $6&255;
  $8 = ($6&255) >>> 4;
  $9 = $i$01 << 1;
  $10 = ((($this) + ($9)|0) + 2204|0);
  HEAP8[$10>>0] = $8;
  $11 = $7 & 15;
  $12 = $11&255;
  $13 = $9 | 1;
  $14 = ((($this) + ($13)|0) + 2204|0);
  HEAP8[$14>>0] = $12;
  $15 = (($i$01) + 1)|0;
  $exitcond = ($15|0)==(128);
  if ($exitcond) {
   break;
  } else {
   $i$01 = $15;
  }
 }
 $16 = (($this) + 1612|0);
 _memcpy(($16|0),(80|0),256)|0;
 __ZN8SNES_SPC5resetEv($this);
 STACKTOP = sp;return (0|0);
}
function __ZN8SNES_SPC5resetEv($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2716|0);
 _memset(($0|0),-1,65536)|0;
 __ZN8SNES_SPC10ram_loadedEv($this);
 __ZN8SNES_SPC12reset_commonEi($this,15);
 __ZN7SPC_DSP5resetEv($this);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC9set_tempoEi($this,$t) {
 $this = $this|0;
 $t = $t|0;
 var $$ = 0, $$t = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2008|0);
 HEAP32[$0>>2] = $t;
 $1 = ($t|0)==(0);
 $$t = $1 ? 1 : $t;
 $2 = $$t >> 1;
 $3 = (($2) + 4096)|0;
 $4 = (($3|0) / ($$t|0))&-1;
 $5 = ($4|0)<(4);
 $$ = $5 ? 4 : $4;
 $6 = (($this) + 1920|0);
 HEAP32[$6>>2] = $$;
 $7 = $$ << 3;
 $8 = (($this) + 1896|0);
 HEAP32[$8>>2] = $7;
 $9 = (($this) + 1872|0);
 HEAP32[$9>>2] = $7;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC13timers_loadedEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1941|0);
 $1 = (($this) + 1950|0);
 $2 = HEAP8[$1>>0]|0;
 $3 = $2&255;
 $4 = (($3) + 255)|0;
 $5 = $4 & 255;
 $6 = (($5) + 1)|0;
 $7 = (($this) + 1876|0);
 HEAP32[$7>>2] = $6;
 $8 = HEAP8[$0>>0]|0;
 $9 = $8&255;
 $10 = $9 & 1;
 $11 = (($this) + 1884|0);
 HEAP32[$11>>2] = $10;
 $12 = (($this) + 1969|0);
 $13 = HEAP8[$12>>0]|0;
 $14 = $13&255;
 $15 = $14 & 15;
 $16 = (($this) + 1888|0);
 HEAP32[$16>>2] = $15;
 $17 = (($this) + 1951|0);
 $18 = HEAP8[$17>>0]|0;
 $19 = $18&255;
 $20 = (($19) + 255)|0;
 $21 = $20 & 255;
 $22 = (($21) + 1)|0;
 $23 = (($this) + 1900|0);
 HEAP32[$23>>2] = $22;
 $24 = HEAP8[$0>>0]|0;
 $25 = $24&255;
 $26 = $25 >>> 1;
 $27 = $26 & 1;
 $28 = (($this) + 1908|0);
 HEAP32[$28>>2] = $27;
 $29 = (($this) + 1970|0);
 $30 = HEAP8[$29>>0]|0;
 $31 = $30&255;
 $32 = $31 & 15;
 $33 = (($this) + 1912|0);
 HEAP32[$33>>2] = $32;
 $34 = (($this) + 1952|0);
 $35 = HEAP8[$34>>0]|0;
 $36 = $35&255;
 $37 = (($36) + 255)|0;
 $38 = $37 & 255;
 $39 = (($38) + 1)|0;
 $40 = (($this) + 1924|0);
 HEAP32[$40>>2] = $39;
 $41 = HEAP8[$0>>0]|0;
 $42 = $41&255;
 $43 = $42 >>> 2;
 $44 = $43 & 1;
 $45 = (($this) + 1932|0);
 HEAP32[$45>>2] = $44;
 $46 = (($this) + 1971|0);
 $47 = HEAP8[$46>>0]|0;
 $48 = $47&255;
 $49 = $48 & 15;
 $50 = (($this) + 1936|0);
 HEAP32[$50>>2] = $49;
 $51 = (($this) + 2008|0);
 $52 = HEAP32[$51>>2]|0;
 __ZN8SNES_SPC9set_tempoEi($this,$52);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC9load_regsEPKh($this,$in) {
 $this = $this|0;
 $in = $in|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 $0 = (($this) + 1940|0);
 dest=$0+0|0; src=$in+0|0; stop=dest+16|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 $1 = (($this) + 1956|0);
 _memmove(($1|0),($in|0),16)|0;
 HEAP8[$1>>0] = 0;
 $2 = (($this) + 1957|0);
 HEAP8[$2>>0] = 0;
 $3 = (($this) + 1966|0);
 HEAP8[$3>>0] = 0;
 $4 = (($this) + 1967|0);
 HEAP8[$4>>0] = 0;
 $5 = (($this) + 1968|0);
 HEAP8[$5>>0] = 0;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC10ram_loadedEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2072|0);
 HEAP32[$0>>2] = 0;
 $1 = (($this) + 2460|0);
 $2 = (($this) + 2956|0);
 __ZN8SNES_SPC9load_regsEPKh($this,$2);
 _memset(($1|0),-1,256)|0;
 $3 = (($this) + 68252|0);
 _memset(($3|0),-1,256)|0;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC11regs_loadedEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1941|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1&255;
 $3 = $2 & 128;
 __ZN8SNES_SPC10enable_romEi($this,$3);
 __ZN8SNES_SPC13timers_loadedEv($this);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC15reset_time_regsEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2020|0);
 HEAP32[$0>>2] = 0;
 $1 = (($this) + 2004|0);
 HEAP8[$1>>0] = 0;
 $2 = (($this) + 2000|0);
 HEAP32[$2>>2] = 0;
 $3 = (($this) + 1996|0);
 HEAP32[$3>>2] = 33;
 $4 = (($this) + 1868|0);
 HEAP32[$4>>2] = 1;
 $5 = (($this) + 1880|0);
 HEAP32[$5>>2] = 0;
 $6 = (($this) + 1892|0);
 HEAP32[$6>>2] = 1;
 $7 = (($this) + 1904|0);
 HEAP32[$7>>2] = 0;
 $8 = (($this) + 1916|0);
 HEAP32[$8>>2] = 1;
 $9 = (($this) + 1928|0);
 HEAP32[$9>>2] = 0;
 __ZN8SNES_SPC11regs_loadedEv($this);
 $10 = (($this) + 2024|0);
 HEAP32[$10>>2] = 0;
 __ZN8SNES_SPC9reset_bufEv($this);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC9reset_bufEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $out$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2040|0);
 $1 = (($this) + 2056|0);
 $out$01 = $0;
 while(1) {
  $2 = (($out$01) + 2|0);
  HEAP16[$out$01>>1] = 0;
  $3 = ($2>>>0)<($1>>>0);
  if ($3) {
   $out$01 = $2;
  } else {
   break;
  }
 }
 $4 = (($this) + 2036|0);
 HEAP32[$4>>2] = $2;
 $5 = (($this) + 2028|0);
 HEAP32[$5>>2] = 0;
 __ZN7SPC_DSP10set_outputEPsi($this,0,0);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC12reset_commonEi($this,$timer_counter_init) {
 $this = $this|0;
 $timer_counter_init = $timer_counter_init|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $scevgep = 0, $scevgep3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $timer_counter_init&255;
 $scevgep3 = (($this) + 1969|0);
 _memset(($scevgep3|0),($0|0),3)|0;
 $1 = (($this) + 1972|0);
 ;HEAP32[$1+0>>2]=0|0;HEAP32[$1+4>>2]=0|0;HEAP32[$1+8>>2]=0|0;HEAP32[$1+12>>2]=0|0;HEAP32[$1+16>>2]=0|0;HEAP32[$1+20>>2]=0|0;
 HEAP32[$1>>2] = 65472;
 $2 = (($this) + 1940|0);
 HEAP8[$2>>0] = 10;
 $3 = (($this) + 1941|0);
 HEAP8[$3>>0] = -80;
 $scevgep = (($this) + 1960|0);
 HEAP8[$scevgep>>0]=0&255;HEAP8[$scevgep+1>>0]=(0>>8)&255;HEAP8[$scevgep+2>>0]=(0>>16)&255;HEAP8[$scevgep+3>>0]=0>>24;
 __ZN8SNES_SPC15reset_time_regsEv($this);
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC8load_spcEPKvl($this,$data,$size) {
 $this = $this|0;
 $data = $data|0;
 $size = $size|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($size|0)<(35);
 if ($0) {
  $$0 = 808;
  STACKTOP = sp;return ($$0|0);
 }
 $1 = (_memcmp($data,768,27)|0);
 $2 = ($1|0)==(0);
 if (!($2)) {
  $$0 = 808;
  STACKTOP = sp;return ($$0|0);
 }
 $3 = ($size|0)<(65920);
 if ($3) {
  $$0 = 824;
  STACKTOP = sp;return ($$0|0);
 }
 $4 = (($data) + 38|0);
 $5 = HEAP8[$4>>0]|0;
 $6 = $5&255;
 $7 = $6 << 8;
 $8 = (($data) + 37|0);
 $9 = HEAP8[$8>>0]|0;
 $10 = $9&255;
 $11 = $7 | $10;
 $12 = (($this) + 1972|0);
 HEAP32[$12>>2] = $11;
 $13 = (($data) + 39|0);
 $14 = HEAP8[$13>>0]|0;
 $15 = $14&255;
 $16 = (($this) + 1976|0);
 HEAP32[$16>>2] = $15;
 $17 = (($data) + 40|0);
 $18 = HEAP8[$17>>0]|0;
 $19 = $18&255;
 $20 = (($this) + 1980|0);
 HEAP32[$20>>2] = $19;
 $21 = (($data) + 41|0);
 $22 = HEAP8[$21>>0]|0;
 $23 = $22&255;
 $24 = (($this) + 1984|0);
 HEAP32[$24>>2] = $23;
 $25 = (($data) + 42|0);
 $26 = HEAP8[$25>>0]|0;
 $27 = $26&255;
 $28 = (($this) + 1988|0);
 HEAP32[$28>>2] = $27;
 $29 = (($data) + 43|0);
 $30 = HEAP8[$29>>0]|0;
 $31 = $30&255;
 $32 = (($this) + 1992|0);
 HEAP32[$32>>2] = $31;
 $33 = (($this) + 2716|0);
 $34 = (($data) + 256|0);
 _memcpy(($33|0),($34|0),65536)|0;
 __ZN8SNES_SPC10ram_loadedEv($this);
 $35 = (($data) + 65792|0);
 __ZN7SPC_DSP4loadEPKh($this,$35);
 __ZN8SNES_SPC15reset_time_regsEv($this);
 $$0 = 0;
 STACKTOP = sp;return ($$0|0);
}
function __ZN8SNES_SPC10clear_echoEv($this) {
 $this = $this|0;
 var $$ = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZNK7SPC_DSP4readEi($this,108)|0);
 $1 = $0 & 32;
 $2 = ($1|0)==(0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 $3 = (__ZNK7SPC_DSP4readEi($this,109)|0);
 $4 = $3 << 8;
 $5 = (__ZNK7SPC_DSP4readEi($this,125)|0);
 $6 = $5 << 11;
 $7 = $6 & 30720;
 $8 = (($7) + ($4))|0;
 $9 = ($8|0)>(65536);
 $$ = $9 ? 65536 : $8;
 $10 = ((($this) + ($4)|0) + 2716|0);
 $11 = (($$) - ($4))|0;
 _memset(($10|0),-1,($11|0))|0;
 STACKTOP = sp;return;
}
function __ZN8SNES_SPC10set_outputEPsi($this,$out,$size) {
 $this = $this|0;
 $out = $out|0;
 $size = $size|0;
 var $$0$lcssa = 0, $$05 = 0, $$11 = 0, $$2 = 0, $$lcssa3 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $in$0$lcssa = 0;
 var $in$06 = 0, $in$12 = 0, $or$cond = 0, $or$cond4 = 0, $out_end$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $size & 1;
 $1 = ($0|0)==(0);
 if (!($1)) {
  ___assert_fail((848|0),(864|0),279,(888|0));
  // unreachable;
 }
 $2 = (($this) + 2024|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = $3 & 31;
 HEAP32[$2>>2] = $4;
 $5 = ($out|0)==(0|0);
 if ($5) {
  __ZN8SNES_SPC9reset_bufEv($this);
  STACKTOP = sp;return;
 }
 $6 = (($out) + ($size<<1)|0);
 $7 = (($this) + 2028|0);
 HEAP32[$7>>2] = $out;
 $8 = (($this) + 2032|0);
 HEAP32[$8>>2] = $6;
 $9 = (($this) + 2040|0);
 $10 = (($this) + 2036|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = ($9>>>0)<($11>>>0);
 $13 = ($size|0)>(0);
 $or$cond4 = $12 & $13;
 if ($or$cond4) {
  $14 = HEAP32[$10>>2]|0;
  $$05 = $out;$in$06 = $9;
  while(1) {
   $15 = (($in$06) + 2|0);
   $16 = HEAP16[$in$06>>1]|0;
   $17 = (($$05) + 2|0);
   HEAP16[$$05>>1] = $16;
   $18 = ($15>>>0)<($14>>>0);
   $19 = ($17>>>0)<($6>>>0);
   $or$cond = $18 & $19;
   if ($or$cond) {
    $$05 = $17;$in$06 = $15;
   } else {
    $$0$lcssa = $17;$$lcssa3 = $19;$in$0$lcssa = $15;
    break;
   }
  }
 } else {
  $$0$lcssa = $out;$$lcssa3 = $13;$in$0$lcssa = $9;
 }
 if ($$lcssa3) {
  $$2 = $$0$lcssa;$out_end$0 = $6;
 } else {
  $20 = (__ZN7SPC_DSP5extraEv($this)|0);
  $21 = (($20) + 32|0);
  $22 = HEAP32[$10>>2]|0;
  $23 = ($in$0$lcssa>>>0)<($22>>>0);
  if ($23) {
   $24 = HEAP32[$10>>2]|0;
   $$11 = $20;$in$12 = $in$0$lcssa;
   while(1) {
    $25 = (($in$12) + 2|0);
    $26 = HEAP16[$in$12>>1]|0;
    $27 = (($$11) + 2|0);
    HEAP16[$$11>>1] = $26;
    $28 = ($25>>>0)<($24>>>0);
    if ($28) {
     $$11 = $27;$in$12 = $25;
    } else {
     break;
    }
   }
   $29 = ($27>>>0)>($21>>>0);
   if ($29) {
    ___assert_fail((904|0),(864|0),303,(888|0));
    // unreachable;
   } else {
    $$2 = $27;$out_end$0 = $21;
   }
  } else {
   $$2 = $20;$out_end$0 = $21;
  }
 }
 $30 = $out_end$0;
 $31 = $$2;
 $32 = (($30) - ($31))|0;
 $33 = $32 >> 1;
 __ZN7SPC_DSP10set_outputEPsi($this,$$2,$33);
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP5extraEv($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1580|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN8SNES_SPC10save_extraEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $dsp_end$0 = 0, $in$04 = 0, $in$12 = 0, $main_end$0 = 0, $or$cond = 0, $out$0$lcssa = 0, $out$03 = 0, $out$1$lcssa = 0, $out$11 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2032|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (__ZNK7SPC_DSP7out_posEv($this)|0);
 $3 = (($this) + 2028|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4>>>0)>($2>>>0);
 $6 = ($2>>>0)>($1>>>0);
 $or$cond = $5 | $6;
 if ($or$cond) {
  $dsp_end$0 = $2;$main_end$0 = $1;
 } else {
  $7 = (__ZN7SPC_DSP5extraEv($this)|0);
  $dsp_end$0 = $7;$main_end$0 = $2;
 }
 $8 = (($this) + 2040|0);
 $9 = HEAP32[$3>>2]|0;
 $10 = (__ZNK8SNES_SPC12sample_countEv($this)|0);
 $11 = (($9) + ($10<<1)|0);
 $12 = ($11>>>0)<($main_end$0>>>0);
 if ($12) {
  $in$04 = $11;$out$03 = $8;
  while(1) {
   $13 = HEAP16[$in$04>>1]|0;
   $14 = (($out$03) + 2|0);
   HEAP16[$out$03>>1] = $13;
   $15 = (($in$04) + 2|0);
   $16 = ($15>>>0)<($main_end$0>>>0);
   if ($16) {
    $in$04 = $15;$out$03 = $14;
   } else {
    $out$0$lcssa = $14;
    break;
   }
  }
 } else {
  $out$0$lcssa = $8;
 }
 $17 = (__ZN7SPC_DSP5extraEv($this)|0);
 $18 = ($17>>>0)<($dsp_end$0>>>0);
 if ($18) {
  $in$12 = $17;$out$11 = $out$0$lcssa;
  while(1) {
   $19 = HEAP16[$in$12>>1]|0;
   $20 = (($out$11) + 2|0);
   HEAP16[$out$11>>1] = $19;
   $21 = (($in$12) + 2|0);
   $22 = ($21>>>0)<($dsp_end$0>>>0);
   if ($22) {
    $in$12 = $21;$out$11 = $20;
   } else {
    $out$1$lcssa = $20;
    break;
   }
  }
 } else {
  $out$1$lcssa = $out$0$lcssa;
 }
 $23 = (($this) + 2036|0);
 HEAP32[$23>>2] = $out$1$lcssa;
 $24 = (($this) + 2072|0);
 $25 = ($out$1$lcssa>>>0)>($24>>>0);
 if ($25) {
  ___assert_fail((920|0),(864|0),334,(960|0));
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZNK7SPC_DSP7out_posEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1568|0);
 $1 = HEAP32[$0>>2]|0;
 STACKTOP = sp;return ($1|0);
}
function __ZNK8SNES_SPC12sample_countEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 2024|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = $1 >> 5;
 $3 = $2 << 1;
 STACKTOP = sp;return ($3|0);
}
function __ZN8SNES_SPC4playEiPs($this,$count,$out) {
 $this = $this|0;
 $count = $count|0;
 $out = $out|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $count & 1;
 $1 = ($0|0)==(0);
 if (!($1)) {
  ___assert_fail((976|0),(864|0),339,(1000|0));
  // unreachable;
 }
 $2 = ($count|0)==(0);
 if (!($2)) {
  __ZN8SNES_SPC10set_outputEPsi($this,$out,$count);
  $3 = $count << 4;
  __ZN8SNES_SPC9end_frameEi($this,$3);
 }
 $4 = (($this) + 2020|0);
 $5 = HEAP32[$4>>2]|0;
 HEAP32[$4>>2] = 0;
 STACKTOP = sp;return ($5|0);
}
function _spc_new() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $s$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZN8SNES_SPCnwEj(68508)|0);
 $1 = ($0|0)==(0|0);
 if ($1) {
  $s$0 = 0;
 } else {
  $2 = (__ZN8SNES_SPC4initEv($0)|0);
  $3 = ($2|0)==(0|0);
  if ($3) {
   $s$0 = $0;
  } else {
   __ZN8SNES_SPCdlEPv($0);
   $s$0 = 0;
  }
 }
 STACKTOP = sp;return ($s$0|0);
}
function __ZN8SNES_SPCnwEj($s) {
 $s = $s|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_malloc($s)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN8SNES_SPCdlEPv($p) {
 $p = $p|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _free($p);
 STACKTOP = sp;return;
}
function _spc_set_output($s,$p,$n) {
 $s = $s|0;
 $p = $p|0;
 $n = $n|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN8SNES_SPC10set_outputEPsi($s,$p,$n);
 STACKTOP = sp;return;
}
function _spc_set_tempo($s,$tempo) {
 $s = $s|0;
 $tempo = $tempo|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN8SNES_SPC9set_tempoEi($s,$tempo);
 STACKTOP = sp;return;
}
function _spc_load_spc($s,$p,$n) {
 $s = $s|0;
 $p = $p|0;
 $n = $n|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZN8SNES_SPC8load_spcEPKvl($s,$p,$n)|0);
 STACKTOP = sp;return ($0|0);
}
function _spc_clear_echo($s) {
 $s = $s|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN8SNES_SPC10clear_echoEv($s);
 STACKTOP = sp;return;
}
function _spc_play($s,$count,$out) {
 $s = $s|0;
 $count = $count|0;
 $out = $out|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZN8SNES_SPC4playEiPs($s,$count,$out)|0);
 STACKTOP = sp;return ($0|0);
}
function _spc_filter_new() {
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (__ZN10SPC_FilternwEj(32)|0);
 $1 = ($0|0)==(0|0);
 if ($1) {
  $2 = 0;
 } else {
  __ZN10SPC_FilterC2Ev($0);
  $2 = $0;
 }
 STACKTOP = sp;return ($2|0);
}
function __ZN10SPC_FilternwEj($s) {
 $s = $s|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_malloc($s)|0);
 STACKTOP = sp;return ($0|0);
}
function __ZN10SPC_FilterdlEPv($p) {
 $p = $p|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _free($p);
 STACKTOP = sp;return;
}
function _spc_filter_run($f,$p,$s) {
 $f = $f|0;
 $p = $p|0;
 $s = $s|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN10SPC_Filter3runEPsi($f,$p,$s);
 STACKTOP = sp;return;
}
function _spc_filter_clear($f) {
 $f = $f|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN10SPC_Filter5clearEv($f);
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP10set_outputEPsi($this,$out,$size) {
 $this = $this|0;
 $out = $out|0;
 $size = $size|0;
 var $$out = 0, $$size = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $size & 1;
 $1 = ($0|0)==(0);
 if ($1) {
  $2 = ($out|0)==(0|0);
  $3 = (($this) + 1580|0);
  $$out = $2 ? $3 : $out;
  $$size = $2 ? 16 : $size;
  $4 = (($this) + 1576|0);
  HEAP32[$4>>2] = $$out;
  $5 = (($this) + 1568|0);
  HEAP32[$5>>2] = $$out;
  $6 = (($$out) + ($$size<<1)|0);
  $7 = (($this) + 1572|0);
  HEAP32[$7>>2] = $6;
  STACKTOP = sp;return;
 } else {
  ___assert_fail((1008|0),(1024|0),78,(1040|0));
  // unreachable;
 }
}
function __ZN7SPC_DSP3runEi($this,$clock_count) {
 $this = $this|0;
 $clock_count = $clock_count|0;
 var $$ = 0, $$1 = 0, $$30 = 0, $$31 = 0, $$32 = 0, $$sum = 0, $$sum10 = 0, $$sum11 = 0, $$sum1213 = 0, $$sum14 = 0, $$sum1516 = 0, $$sum17 = 0, $$sum18 = 0, $$sum2021 = 0, $$sum22 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum27 = 0, $$sum29 = 0, $0 = 0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0;
 var $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0;
 var $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0;
 var $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0;
 var $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0;
 var $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0;
 var $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0;
 var $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0;
 var $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0;
 var $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0;
 var $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0;
 var $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0;
 var $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0;
 var $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0;
 var $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $brr_addr$0 = 0, $brr_header$0 = 0, $brr_header$1 = 0, $brr_offset$0 = 0, $count$0 = 0, $echo_out_l$0 = 0, $echo_out_l$1 = 0, $echo_out_r$0 = 0, $echo_out_r$1 = 0, $env$0 = 0, $env$1 = 0, $env$2 = 0, $env_data$0 = 0, $l1$0 = 0, $l3$0 = 0;
 var $main_out_l$0 = 0, $main_out_l$1 = 0, $main_out_r$0 = 0, $main_out_r$1 = 0, $nybbles$033 = 0, $out$0 = 0, $output$0 = 0, $output$1 = 0, $output$2 = 0, $output$3 = 0, $pitch$0 = 0, $pitch$1 = 0, $pmon_input$0 = 0, $pos$0$ = 0, $pos$034 = 0, $r2$0 = 0, $r4$0 = 0, $rate$0 = 0, $s$0 = 0, $s$1 = 0;
 var $sext = 0, $sext2 = 0, $sext26 = 0, $sext28 = 0, $sext3 = 0, $sext4 = 0, $sext5 = 0, $sext6 = 0, $sext7 = 0, $sext8 = 0, $v$0 = 0, $v_regs$0 = 0, $vbit$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 280|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (($1) + ($clock_count))|0;
 $3 = $2 >> 5;
 $4 = $2 & 31;
 HEAP32[$0>>2] = $4;
 $5 = ($3|0)==(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = (($this) + 1556|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($this) + 93|0);
 $9 = HEAP8[$8>>0]|0;
 $10 = $9&255;
 $11 = $10 << 8;
 $12 = (($this) + 45|0);
 $13 = HEAP8[$12>>0]|0;
 $14 = $13&255;
 $15 = $14 >>> 1;
 $16 = (($this) + 61|0);
 $17 = HEAP8[$16>>0]|0;
 $18 = $17&255;
 $19 = $15 | $18;
 $20 = (($this) + 108|0);
 $21 = HEAP8[$20>>0]|0;
 $22 = $21&255;
 $23 = $22 & 31;
 $24 = (($this) + 12|0);
 $25 = HEAP8[$24>>0]|0;
 $26 = $25 << 24 >> 24;
 $27 = (($this) + 28|0);
 $28 = HEAP8[$27>>0]|0;
 $29 = $28 << 24 >> 24;
 $30 = Math_imul($29, $26)|0;
 $31 = (($this) + 1564|0);
 $32 = HEAP32[$31>>2]|0;
 $33 = ($30|0)<($32|0);
 $34 = (0 - ($26))|0;
 $$30 = $33 ? $34 : $26;
 $35 = (($this) + 260|0);
 $36 = ((($this) + ($23<<2)|0) + 1428|0);
 $37 = (1056 + ($23<<2)|0);
 $38 = HEAP32[$37>>2]|0;
 $39 = (($this) + 268|0);
 $40 = (($this) + 308|0);
 $41 = (($this) + 124|0);
 $42 = (($this) + 304|0);
 $43 = (($this) + 264|0);
 $44 = (($this) + 124|0);
 $45 = (($this) + 77|0);
 $46 = (($this) + 268|0);
 $47 = (($this) + 272|0);
 $48 = (($this) + 109|0);
 $49 = (($this) + 125|0);
 $50 = (($this) + 276|0);
 $51 = (($this) + 276|0);
 $52 = (($this) + 256|0);
 $53 = (($this) + 192|0);
 $54 = (($this) + 128|0);
 $55 = (($this) + 127|0);
 $56 = (($this) + 15|0);
 $57 = (($this) + 31|0);
 $58 = (($this) + 47|0);
 $59 = (($this) + 63|0);
 $60 = (($this) + 79|0);
 $61 = (($this) + 95|0);
 $62 = (($this) + 111|0);
 $63 = (($this) + 13|0);
 $64 = (($this) + 44|0);
 $65 = (($this) + 60|0);
 $66 = (($this) + 1568|0);
 $67 = (($this) + 1572|0);
 $68 = (($this) + 1580|0);
 $69 = (($this) + 1612|0);
 $70 = (($this) + 264|0);
 $71 = (($this) + 300|0);
 $72 = (($this) + 92|0);
 $73 = (($this) + 304|0);
 $count$0 = $3;
 L4: while(1) {
  $74 = HEAP32[$35>>2]|0;
  $75 = $74 ^ 1;
  HEAP32[$35>>2] = $75;
  $76 = ($74|0)==(1);
  if (!($76)) {
   $77 = HEAP32[$70>>2]|0;
   $78 = $77 ^ -1;
   $79 = HEAP32[$71>>2]|0;
   $80 = $79 & $78;
   HEAP32[$71>>2] = $80;
   HEAP32[$70>>2] = $80;
   $81 = HEAP8[$72>>0]|0;
   $82 = $81&255;
   HEAP32[$73>>2] = $82;
  }
  __ZN7SPC_DSP11run_counterEi($this,1);
  __ZN7SPC_DSP11run_counterEi($this,2);
  __ZN7SPC_DSP11run_counterEi($this,3);
  $83 = HEAP32[$36>>2]|0;
  $84 = HEAP32[$83>>2]|0;
  $85 = $38 & $84;
  $86 = ($85|0)==(0);
  if ($86) {
   $87 = HEAP32[$39>>2]|0;
   $88 = $87 << 13;
   $89 = $87 << 14;
   $90 = $88 ^ $89;
   $91 = $90 & 16384;
   $92 = $87 >> 1;
   $93 = $91 ^ $92;
   HEAP32[$39>>2] = $93;
   $echo_out_l$0 = 0;$echo_out_r$0 = 0;$main_out_l$0 = 0;$main_out_r$0 = 0;$pmon_input$0 = 0;$v$0 = $40;$v_regs$0 = $this;$vbit$0 = 1;
  } else {
   $echo_out_l$0 = 0;$echo_out_r$0 = 0;$main_out_l$0 = 0;$main_out_r$0 = 0;$pmon_input$0 = 0;$v$0 = $40;$v_regs$0 = $this;$vbit$0 = 1;
  }
  while(1) {
   $94 = (($v$0) + 104|0);
   $95 = HEAP32[$94>>2]|0;
   $96 = (($7) + ($95)|0);
   $97 = HEAP8[$96>>0]|0;
   $98 = $97&255;
   $99 = (($v$0) + 112|0);
   $100 = HEAP32[$99>>2]|0;
   $101 = (($v_regs$0) + 2|0);
   $102 = (__Z8get_le16PKv($101)|0);
   $103 = $102 & 16383;
   $104 = HEAP8[$12>>0]|0;
   $105 = $104&255;
   $106 = $105 & $vbit$0;
   $107 = ($106|0)==(0);
   if ($107) {
    $pitch$0 = $103;
   } else {
    $108 = $pmon_input$0 >> 5;
    $109 = Math_imul($103, $108)|0;
    $110 = $109 >> 10;
    $111 = (($110) + ($103))|0;
    $pitch$0 = $111;
   }
   $112 = (($100) + -1)|0;
   $113 = ($100|0)>(0);
   if ($113) {
    HEAP32[$99>>2] = $112;
    $114 = ($112|0)==(4);
    if ($114) {
     $115 = (($v_regs$0) + 4|0);
     $116 = HEAP8[$115>>0]|0;
     $117 = $116&255;
     $118 = $117 << 2;
     $$sum29 = (($118) + ($11))|0;
     $119 = (($7) + ($$sum29)|0);
     $120 = (__Z8get_le16PKv($119)|0);
     HEAP32[$94>>2] = $120;
     $121 = (($v$0) + 108|0);
     HEAP32[$121>>2] = 1;
     $122 = (($v$0) + 96|0);
     HEAP32[$122>>2] = $v$0;
     $brr_header$0 = 0;
    } else {
     $brr_header$0 = $98;
    }
    $123 = (($v$0) + 120|0);
    HEAP32[$123>>2] = 0;
    $124 = (($v$0) + 124|0);
    HEAP32[$124>>2] = 0;
    $125 = $112 & 3;
    $126 = ($125|0)!=(0);
    $127 = $126 ? 16384 : 0;
    $128 = (($v$0) + 100|0);
    HEAP32[$128>>2] = $127;
    $brr_header$1 = $brr_header$0;$pitch$1 = 0;
   } else {
    $brr_header$1 = $98;$pitch$1 = $pitch$0;
   }
   $129 = (($v$0) + 120|0);
   $130 = HEAP32[$129>>2]|0;
   $131 = $130 >>> 4;
   $132 = $131&255;
   $133 = (($v_regs$0) + 8|0);
   HEAP8[$133>>0] = $132;
   $134 = ($130|0)==(0);
   if ($134) {
    $echo_out_l$1 = $echo_out_l$0;$echo_out_r$1 = $echo_out_r$0;$main_out_l$1 = $main_out_l$0;$main_out_r$1 = $main_out_r$0;$output$3 = 0;
   } else {
    $135 = (($v$0) + 100|0);
    $136 = HEAP32[$135>>2]|0;
    $137 = $136 >>> 3;
    $138 = $137 & 510;
    $139 = (1184 + ($138<<1)|0);
    $$sum11 = (510 - ($138))|0;
    $140 = (1184 + ($$sum11<<1)|0);
    $141 = $136 >>> 12;
    $142 = (($v$0) + 96|0);
    $143 = HEAP32[$142>>2]|0;
    $144 = (($143) + ($141<<2)|0);
    $145 = $vbit$0 & $19;
    $146 = ($145|0)==(0);
    if ($146) {
     $147 = HEAP16[$139>>1]|0;
     $148 = $147 << 16 >> 16;
     $149 = HEAP32[$144>>2]|0;
     $150 = Math_imul($148, $149)|0;
     $$sum1213 = $138 | 1;
     $151 = (1184 + ($$sum1213<<1)|0);
     $152 = HEAP16[$151>>1]|0;
     $153 = $152 << 16 >> 16;
     $$sum14 = (($141) + 1)|0;
     $154 = (($143) + ($$sum14<<2)|0);
     $155 = HEAP32[$154>>2]|0;
     $156 = Math_imul($153, $155)|0;
     $157 = (($156) + ($150))|0;
     $$sum1516 = $$sum11 | 1;
     $158 = (1184 + ($$sum1516<<1)|0);
     $159 = HEAP16[$158>>1]|0;
     $160 = $159 << 16 >> 16;
     $$sum17 = (($141) + 2)|0;
     $161 = (($143) + ($$sum17<<2)|0);
     $162 = HEAP32[$161>>2]|0;
     $163 = Math_imul($160, $162)|0;
     $164 = (($157) + ($163))|0;
     $165 = HEAP16[$140>>1]|0;
     $166 = $165 << 16 >> 16;
     $$sum18 = (($141) + 3)|0;
     $167 = (($143) + ($$sum18<<2)|0);
     $168 = HEAP32[$167>>2]|0;
     $169 = Math_imul($166, $168)|0;
     $170 = (($164) + ($169))|0;
     $171 = $170 >> 11;
     $172 = Math_imul($171, $130)|0;
     $173 = $172 >> 11;
     $output$2 = $173;
    } else {
     $174 = HEAP32[$46>>2]|0;
     $175 = $174 << 17;
     $176 = $175 >> 16;
     $177 = HEAP8[$16>>0]|0;
     $178 = $177&255;
     $179 = $178 & $vbit$0;
     $180 = ($179|0)==(0);
     if ($180) {
      $181 = HEAP16[$139>>1]|0;
      $182 = $181 << 16 >> 16;
      $183 = HEAP32[$144>>2]|0;
      $184 = Math_imul($182, $183)|0;
      $185 = $184 >>> 11;
      $$sum2021 = $138 | 1;
      $186 = (1184 + ($$sum2021<<1)|0);
      $187 = HEAP16[$186>>1]|0;
      $188 = $187 << 16 >> 16;
      $$sum22 = (($141) + 1)|0;
      $189 = (($143) + ($$sum22<<2)|0);
      $190 = HEAP32[$189>>2]|0;
      $191 = Math_imul($188, $190)|0;
      $192 = $191 >>> 11;
      $193 = (($192) + ($185))|0;
      $$sum2324 = $$sum11 | 1;
      $194 = (1184 + ($$sum2324<<1)|0);
      $195 = HEAP16[$194>>1]|0;
      $196 = $195 << 16 >> 16;
      $$sum25 = (($141) + 2)|0;
      $197 = (($143) + ($$sum25<<2)|0);
      $198 = HEAP32[$197>>2]|0;
      $199 = Math_imul($196, $198)|0;
      $200 = $199 >>> 11;
      $201 = (($193) + ($200))|0;
      $sext26 = $201 << 16;
      $202 = $sext26 >> 16;
      $203 = HEAP16[$140>>1]|0;
      $204 = $203 << 16 >> 16;
      $$sum27 = (($141) + 3)|0;
      $205 = (($143) + ($$sum27<<2)|0);
      $206 = HEAP32[$205>>2]|0;
      $207 = Math_imul($204, $206)|0;
      $208 = $207 >> 11;
      $209 = (($202) + ($208))|0;
      $sext28 = $209 << 16;
      $210 = $sext28 >> 16;
      $211 = ($210|0)==($209|0);
      if ($211) {
       $output$0 = $209;
      } else {
       $212 = $209 >> 31;
       $213 = $212 ^ 32767;
       $output$0 = $213;
      }
      $214 = $output$0 & -2;
      $output$1 = $214;
     } else {
      $output$1 = $176;
     }
     $215 = Math_imul($output$1, $130)|0;
     $216 = $215 >> 11;
     $217 = $216 & -2;
     $output$2 = $217;
    }
    $218 = (($v$0) + 128|0);
    $219 = HEAP32[$218>>2]|0;
    $220 = Math_imul($219, $output$2)|0;
    $221 = (($v$0) + 132|0);
    $222 = HEAP32[$221>>2]|0;
    $223 = Math_imul($222, $output$2)|0;
    $224 = (($220) + ($main_out_l$0))|0;
    $225 = (($223) + ($main_out_r$0))|0;
    $226 = HEAP8[$45>>0]|0;
    $227 = $226&255;
    $228 = $227 & $vbit$0;
    $229 = ($228|0)==(0);
    if ($229) {
     $echo_out_l$1 = $echo_out_l$0;$echo_out_r$1 = $echo_out_r$0;$main_out_l$1 = $224;$main_out_r$1 = $225;$output$3 = $output$2;
    } else {
     $230 = (($220) + ($echo_out_l$0))|0;
     $231 = (($223) + ($echo_out_r$0))|0;
     $echo_out_l$1 = $230;$echo_out_r$1 = $231;$main_out_l$1 = $224;$main_out_r$1 = $225;$output$3 = $output$2;
    }
   }
   $232 = $output$3 >>> 8;
   $233 = $232&255;
   $234 = (($v_regs$0) + 9|0);
   HEAP8[$234>>0] = $233;
   $235 = HEAP8[$20>>0]|0;
   $236 = ($235<<24>>24)<(0);
   if ($236) {
    label = 25;
   } else {
    $237 = $brr_header$1 & 3;
    $238 = ($237|0)==(1);
    if ($238) {
     label = 25;
    } else {
     $env$0 = $130;
    }
   }
   if ((label|0) == 25) {
    label = 0;
    $239 = (($v$0) + 116|0);
    HEAP32[$239>>2] = 0;
    $env$0 = 0;
   }
   $240 = HEAP32[$35>>2]|0;
   $241 = ($240|0)==(0);
   if (!($241)) {
    $242 = HEAP32[$42>>2]|0;
    $243 = $242 & $vbit$0;
    $244 = ($243|0)==(0);
    if (!($244)) {
     $245 = (($v$0) + 116|0);
     HEAP32[$245>>2] = 0;
    }
    $246 = HEAP32[$43>>2]|0;
    $247 = $246 & $vbit$0;
    $248 = ($247|0)==(0);
    if (!($248)) {
     HEAP32[$99>>2] = 5;
     $249 = (($v$0) + 116|0);
     HEAP32[$249>>2] = 1;
     $250 = $vbit$0 ^ 255;
     $251 = HEAP8[$44>>0]|0;
     $252 = $251&255;
     $253 = $252 & $250;
     $254 = $253&255;
     HEAP8[$44>>0] = $254;
    }
   }
   $255 = HEAP32[$99>>2]|0;
   $256 = ($255|0)==(0);
   L48: do {
    if ($256) {
     $257 = (($v$0) + 116|0);
     $258 = HEAP32[$257>>2]|0;
     $259 = ($258|0)==(0);
     if ($259) {
      $260 = (($env$0) + -8)|0;
      HEAP32[$129>>2] = $260;
      $261 = ($260|0)<(1);
      if (!($261)) {
       label = 58;
       break;
      }
      HEAP32[$129>>2] = 0;
      break;
     }
     $262 = (($v_regs$0) + 5|0);
     $263 = HEAP8[$262>>0]|0;
     $264 = $263&255;
     $265 = (($v_regs$0) + 6|0);
     $266 = HEAP8[$265>>0]|0;
     $267 = $266&255;
     $268 = ($263<<24>>24)<(0);
     do {
      if ($268) {
       $269 = ($258|0)>(2);
       if ($269) {
        $270 = (($env$0) + -1)|0;
        $271 = $270 >> 8;
        $272 = (($270) - ($271))|0;
        $273 = $267 & 31;
        $274 = (($v$0) + 124|0);
        HEAP32[$274>>2] = $272;
        $275 = ((($this) + ($273<<2)|0) + 1428|0);
        $276 = HEAP32[$275>>2]|0;
        $277 = HEAP32[$276>>2]|0;
        $278 = (1056 + ($273<<2)|0);
        $279 = HEAP32[$278>>2]|0;
        $280 = $279 & $277;
        $281 = ($280|0)==(0);
        if (!($281)) {
         label = 58;
         break L48;
        }
        HEAP32[$129>>2] = $272;
        label = 58;
        break L48;
       }
       $282 = ($258|0)==(2);
       if ($282) {
        $283 = (($env$0) + -1)|0;
        $284 = $283 >> 8;
        $285 = (($283) - ($284))|0;
        $286 = $264 >>> 3;
        $287 = $286 & 14;
        $288 = $287 | 16;
        $env$1 = $285;$env_data$0 = $267;$rate$0 = $288;
        break;
       } else {
        $289 = $264 << 1;
        $290 = $289 & 30;
        $291 = $290 | 1;
        $292 = ($291|0)!=(31);
        $293 = $292 ? 32 : 1024;
        $294 = (($293) + ($env$0))|0;
        $env$1 = $294;$env_data$0 = $267;$rate$0 = $291;
        break;
       }
      } else {
       $295 = (($v_regs$0) + 7|0);
       $296 = HEAP8[$295>>0]|0;
       $297 = $296&255;
       $298 = $297 >>> 5;
       $299 = ($296<<24>>24)>(-1);
       if ($299) {
        $300 = $297 << 4;
        $env$1 = $300;$env_data$0 = $297;$rate$0 = 31;
        break;
       }
       $301 = $297 & 31;
       $302 = ($298|0)==(4);
       if ($302) {
        $303 = (($env$0) + -32)|0;
        $env$1 = $303;$env_data$0 = $297;$rate$0 = $301;
        break;
       }
       $304 = ($296&255)<(192);
       if ($304) {
        $305 = (($env$0) + -1)|0;
        $306 = $305 >> 8;
        $307 = (($305) - ($306))|0;
        $env$1 = $307;$env_data$0 = $297;$rate$0 = $301;
        break;
       }
       $308 = (($env$0) + 32)|0;
       $309 = ($298|0)==(7);
       if ($309) {
        $310 = (($v$0) + 124|0);
        $311 = HEAP32[$310>>2]|0;
        $312 = ($311>>>0)>(1535);
        $313 = (($env$0) + 8)|0;
        $$31 = $312 ? $313 : $308;
        $env$1 = $$31;$env_data$0 = $297;$rate$0 = $301;
       } else {
        $env$1 = $308;$env_data$0 = $297;$rate$0 = $301;
       }
      }
     } while(0);
     $314 = $env$1 >> 8;
     $315 = $env_data$0 >>> 5;
     $316 = ($314|0)==($315|0);
     if ($316) {
      $317 = HEAP32[$257>>2]|0;
      $318 = ($317|0)==(2);
      if ($318) {
       HEAP32[$257>>2] = 3;
      }
     }
     $319 = (($v$0) + 124|0);
     HEAP32[$319>>2] = $env$1;
     $320 = ($env$1>>>0)>(2047);
     if ($320) {
      $321 = $env$1 >> 31;
      $322 = $321 & -2047;
      $323 = (($322) + 2047)|0;
      $324 = HEAP32[$257>>2]|0;
      $325 = ($324|0)==(1);
      if ($325) {
       HEAP32[$257>>2] = 2;
       $env$2 = $323;
      } else {
       $env$2 = $323;
      }
     } else {
      $env$2 = $env$1;
     }
     $326 = ((($this) + ($rate$0<<2)|0) + 1428|0);
     $327 = HEAP32[$326>>2]|0;
     $328 = HEAP32[$327>>2]|0;
     $329 = (1056 + ($rate$0<<2)|0);
     $330 = HEAP32[$329>>2]|0;
     $331 = $330 & $328;
     $332 = ($331|0)==(0);
     if ($332) {
      HEAP32[$129>>2] = $env$2;
      label = 58;
     } else {
      label = 58;
     }
    } else {
     label = 58;
    }
   } while(0);
   if ((label|0) == 58) {
    label = 0;
    $333 = (($v$0) + 100|0);
    $334 = HEAP32[$333>>2]|0;
    $335 = $334 & 16383;
    $336 = (($335) + ($pitch$1))|0;
    $337 = ($336|0)>(32767);
    $$ = $337 ? 32767 : $336;
    HEAP32[$333>>2] = $$;
    $338 = ($334|0)>(16383);
    if ($338) {
     $339 = HEAP32[$94>>2]|0;
     $340 = (($v$0) + 108|0);
     $341 = HEAP32[$340>>2]|0;
     $342 = (($341) + ($339))|0;
     $343 = $342 & 65535;
     $344 = (($7) + ($343)|0);
     $345 = HEAP8[$344>>0]|0;
     $346 = $345&255;
     $347 = $346 << 8;
     $348 = (($342) + 1)|0;
     $349 = $348 & 65535;
     $350 = (($7) + ($349)|0);
     $351 = HEAP8[$350>>0]|0;
     $352 = $351&255;
     $353 = $347 | $352;
     $354 = (($341) + 2)|0;
     $355 = ($354|0)>(8);
     if ($355) {
      $356 = ($354|0)==(9);
      if (!($356)) {
       label = 61;
       break L4;
      }
      $357 = (($339) + 9)|0;
      $358 = $357 & 65535;
      $359 = $brr_header$1 & 1;
      $360 = ($359|0)==(0);
      if ($360) {
       $brr_addr$0 = $358;
      } else {
       $361 = (($v_regs$0) + 4|0);
       $362 = HEAP8[$361>>0]|0;
       $363 = $362&255;
       $364 = $363 << 2;
       $365 = $364 | 2;
       $$sum10 = (($365) + ($11))|0;
       $366 = (($7) + ($$sum10)|0);
       $367 = (__Z8get_le16PKv($366)|0);
       $368 = HEAP32[$99>>2]|0;
       $369 = ($368|0)==(0);
       if ($369) {
        $370 = HEAP8[$41>>0]|0;
        $371 = $370&255;
        $372 = $371 | $vbit$0;
        $373 = $372&255;
        HEAP8[$41>>0] = $373;
        $brr_addr$0 = $367;
       } else {
        $brr_addr$0 = $367;
       }
      }
      HEAP32[$94>>2] = $brr_addr$0;
      $brr_offset$0 = 1;
     } else {
      $brr_offset$0 = $354;
     }
     HEAP32[$340>>2] = $brr_offset$0;
     $374 = $brr_header$1 >> 4;
     $375 = (2248 + ($374)|0);
     $376 = HEAP8[$375>>0]|0;
     $377 = $376&255;
     $378 = (($374) + 16)|0;
     $379 = (2248 + ($378)|0);
     $380 = HEAP8[$379>>0]|0;
     $381 = $380&255;
     $382 = (($v$0) + 96|0);
     $383 = HEAP32[$382>>2]|0;
     $384 = (($383) + 16|0);
     $385 = $brr_header$1 & 12;
     $386 = ($385>>>0)>(7);
     $387 = ($385|0)==(8);
     $388 = ($385|0)==(0);
     $nybbles$033 = $353;$pos$034 = $383;
     while(1) {
      $sext7 = $nybbles$033 << 16;
      $389 = $sext7 >> 16;
      $390 = $389 >> $377;
      $391 = $390 << $381;
      $392 = (($pos$034) + 44|0);
      $393 = HEAP32[$392>>2]|0;
      $394 = (($pos$034) + 40|0);
      $395 = HEAP32[$394>>2]|0;
      $396 = $395 >> 1;
      do {
       if ($386) {
        $397 = (($393) + ($391))|0;
        $398 = (($397) - ($396))|0;
        if ($387) {
         $399 = $395 >> 5;
         $400 = Math_imul($393, -3)|0;
         $401 = $400 >> 6;
         $402 = (($401) + ($399))|0;
         $403 = (($402) + ($398))|0;
         $s$0 = $403;
         break;
        } else {
         $404 = Math_imul($393, -13)|0;
         $405 = $404 >> 7;
         $406 = (($398) + ($405))|0;
         $407 = ($396*3)|0;
         $408 = $407 >> 4;
         $409 = (($406) + ($408))|0;
         $s$0 = $409;
         break;
        }
       } else {
        if ($388) {
         $s$0 = $391;
        } else {
         $410 = $393 >> 1;
         $411 = (($410) + ($391))|0;
         $412 = (0 - ($393))|0;
         $413 = $412 >> 5;
         $414 = (($411) + ($413))|0;
         $s$0 = $414;
        }
       }
      } while(0);
      $sext8 = $s$0 << 16;
      $415 = $sext8 >> 16;
      $416 = ($415|0)==($s$0|0);
      if ($416) {
       $s$1 = $s$0;
      } else {
       $417 = $s$0 >> 31;
       $418 = $417 ^ 32767;
       $s$1 = $418;
      }
      $419 = $s$1 << 17;
      $420 = $419 >> 16;
      HEAP32[$pos$034>>2] = $420;
      $421 = (($pos$034) + 48|0);
      HEAP32[$421>>2] = $420;
      $422 = (($pos$034) + 4|0);
      $423 = $nybbles$033 << 4;
      $424 = ($422>>>0)<($384>>>0);
      if ($424) {
       $nybbles$033 = $423;$pos$034 = $422;
      } else {
       break;
      }
     }
     $425 = (($v$0) + 48|0);
     $426 = ($422>>>0)<($425>>>0);
     $pos$0$ = $426 ? $422 : $v$0;
     HEAP32[$382>>2] = $pos$0$;
    }
   }
   $427 = $vbit$0 << 1;
   $428 = (($v_regs$0) + 16|0);
   $429 = (($v$0) + 140|0);
   $430 = ($427|0)<(256);
   if ($430) {
    $echo_out_l$0 = $echo_out_l$1;$echo_out_r$0 = $echo_out_r$1;$main_out_l$0 = $main_out_l$1;$main_out_r$0 = $main_out_r$1;$pmon_input$0 = $output$3;$v$0 = $429;$v_regs$0 = $428;$vbit$0 = $427;
   } else {
    break;
   }
  }
  $431 = HEAP32[$47>>2]|0;
  $432 = HEAP8[$48>>0]|0;
  $433 = $432&255;
  $434 = $433 << 8;
  $435 = (($434) + ($431))|0;
  $436 = $435 & 65535;
  $437 = (($7) + ($436)|0);
  $438 = ($431|0)==(0);
  if ($438) {
   $439 = HEAP8[$49>>0]|0;
   $440 = $439&255;
   $441 = $440 << 11;
   $442 = $441 & 30720;
   HEAP32[$50>>2] = $442;
  }
  $443 = (($431) + 4)|0;
  $444 = HEAP32[$51>>2]|0;
  $445 = ($443|0)>=($444|0);
  $$1 = $445 ? 0 : $443;
  HEAP32[$47>>2] = $$1;
  $446 = (__Z8get_le16PKv($437)|0);
  $sext = $446 << 16;
  $447 = $sext >> 16;
  $$sum = (($436) + 2)|0;
  $448 = (($7) + ($$sum)|0);
  $449 = (__Z8get_le16PKv($448)|0);
  $sext2 = $449 << 16;
  $450 = $sext2 >> 16;
  $451 = HEAP32[$52>>2]|0;
  $452 = (($451) + 8|0);
  $453 = ($452>>>0)<($53>>>0);
  $$32 = $453 ? $452 : $54;
  HEAP32[$52>>2] = $$32;
  $454 = (($$32) + 64|0);
  HEAP32[$454>>2] = $447;
  HEAP32[$$32>>2] = $447;
  $455 = (($$32) + 68|0);
  HEAP32[$455>>2] = $450;
  $456 = (($$32) + 4|0);
  HEAP32[$456>>2] = $450;
  $457 = HEAP8[$55>>0]|0;
  $458 = $457 << 24 >> 24;
  $459 = Math_imul($458, $447)|0;
  $460 = Math_imul($458, $450)|0;
  $461 = (($$32) + 8|0);
  $462 = HEAP32[$461>>2]|0;
  $463 = HEAP8[$56>>0]|0;
  $464 = $463 << 24 >> 24;
  $465 = Math_imul($464, $462)|0;
  $466 = (($465) + ($459))|0;
  $467 = (($$32) + 12|0);
  $468 = HEAP32[$467>>2]|0;
  $469 = Math_imul($468, $464)|0;
  $470 = (($469) + ($460))|0;
  $471 = (($$32) + 16|0);
  $472 = HEAP32[$471>>2]|0;
  $473 = HEAP8[$57>>0]|0;
  $474 = $473 << 24 >> 24;
  $475 = Math_imul($474, $472)|0;
  $476 = (($466) + ($475))|0;
  $477 = (($$32) + 20|0);
  $478 = HEAP32[$477>>2]|0;
  $479 = Math_imul($478, $474)|0;
  $480 = (($470) + ($479))|0;
  $481 = (($$32) + 24|0);
  $482 = HEAP32[$481>>2]|0;
  $483 = HEAP8[$58>>0]|0;
  $484 = $483 << 24 >> 24;
  $485 = Math_imul($484, $482)|0;
  $486 = (($476) + ($485))|0;
  $487 = (($$32) + 28|0);
  $488 = HEAP32[$487>>2]|0;
  $489 = Math_imul($488, $484)|0;
  $490 = (($480) + ($489))|0;
  $491 = (($$32) + 32|0);
  $492 = HEAP32[$491>>2]|0;
  $493 = HEAP8[$59>>0]|0;
  $494 = $493 << 24 >> 24;
  $495 = Math_imul($494, $492)|0;
  $496 = (($486) + ($495))|0;
  $497 = (($$32) + 36|0);
  $498 = HEAP32[$497>>2]|0;
  $499 = Math_imul($498, $494)|0;
  $500 = (($490) + ($499))|0;
  $501 = (($$32) + 40|0);
  $502 = HEAP32[$501>>2]|0;
  $503 = HEAP8[$60>>0]|0;
  $504 = $503 << 24 >> 24;
  $505 = Math_imul($504, $502)|0;
  $506 = (($496) + ($505))|0;
  $507 = (($$32) + 44|0);
  $508 = HEAP32[$507>>2]|0;
  $509 = Math_imul($508, $504)|0;
  $510 = (($500) + ($509))|0;
  $511 = (($$32) + 48|0);
  $512 = HEAP32[$511>>2]|0;
  $513 = HEAP8[$61>>0]|0;
  $514 = $513 << 24 >> 24;
  $515 = Math_imul($514, $512)|0;
  $516 = (($506) + ($515))|0;
  $517 = (($$32) + 52|0);
  $518 = HEAP32[$517>>2]|0;
  $519 = Math_imul($518, $514)|0;
  $520 = (($510) + ($519))|0;
  $521 = (($$32) + 56|0);
  $522 = HEAP32[$521>>2]|0;
  $523 = HEAP8[$62>>0]|0;
  $524 = $523 << 24 >> 24;
  $525 = Math_imul($524, $522)|0;
  $526 = (($516) + ($525))|0;
  $527 = (($$32) + 60|0);
  $528 = HEAP32[$527>>2]|0;
  $529 = Math_imul($528, $524)|0;
  $530 = (($520) + ($529))|0;
  $531 = HEAP8[$20>>0]|0;
  $532 = $531 & 32;
  $533 = ($532<<24>>24)==(0);
  if ($533) {
   $534 = $echo_out_l$1 >> 7;
   $535 = HEAP8[$63>>0]|0;
   $536 = $535 << 24 >> 24;
   $537 = Math_imul($536, $526)|0;
   $538 = $537 >> 14;
   $539 = (($538) + ($534))|0;
   $540 = $echo_out_r$1 >> 7;
   $541 = Math_imul($536, $530)|0;
   $542 = $541 >> 14;
   $543 = (($542) + ($540))|0;
   $sext3 = $539 << 16;
   $544 = $sext3 >> 16;
   $545 = ($544|0)==($539|0);
   if ($545) {
    $l1$0 = $539;
   } else {
    $546 = $539 >> 31;
    $547 = $546 ^ 32767;
    $l1$0 = $547;
   }
   $sext4 = $543 << 16;
   $548 = $sext4 >> 16;
   $549 = ($548|0)==($543|0);
   if ($549) {
    $r2$0 = $543;
   } else {
    $550 = $543 >> 31;
    $551 = $550 ^ 32767;
    $r2$0 = $551;
   }
   __Z8set_le16Pvj($437,$l1$0);
   __Z8set_le16Pvj($448,$r2$0);
  }
  $552 = Math_imul($main_out_l$1, $$30)|0;
  $553 = HEAP8[$64>>0]|0;
  $554 = $553 << 24 >> 24;
  $555 = Math_imul($554, $526)|0;
  $556 = (($555) + ($552))|0;
  $557 = $556 >> 14;
  $558 = Math_imul($main_out_r$1, $29)|0;
  $559 = HEAP8[$65>>0]|0;
  $560 = $559 << 24 >> 24;
  $561 = Math_imul($560, $530)|0;
  $562 = (($561) + ($558))|0;
  $563 = $562 >> 14;
  $sext5 = $557 << 16;
  $564 = $sext5 >> 16;
  $565 = ($564|0)==($557|0);
  if ($565) {
   $l3$0 = $557;
  } else {
   $566 = $556 >> 31;
   $567 = $566 ^ 32767;
   $l3$0 = $567;
  }
  $sext6 = $563 << 16;
  $568 = $sext6 >> 16;
  $569 = ($568|0)==($563|0);
  if ($569) {
   $r4$0 = $563;
  } else {
   $570 = $562 >> 31;
   $571 = $570 ^ 32767;
   $r4$0 = $571;
  }
  $572 = HEAP8[$20>>0]|0;
  $573 = $572 & 64;
  $574 = ($573<<24>>24)==(0);
  $575 = HEAP32[$66>>2]|0;
  $576 = $l3$0&65535;
  $577 = $574 ? $576 : 0;
  HEAP16[$575>>1] = $577;
  $578 = $r4$0&65535;
  $579 = $574 ? $578 : 0;
  $580 = (($575) + 2|0);
  HEAP16[$580>>1] = $579;
  $581 = (($575) + 4|0);
  $582 = HEAP32[$67>>2]|0;
  $583 = ($581>>>0)<($582>>>0);
  if ($583) {
   $out$0 = $581;
  } else {
   HEAP32[$67>>2] = $69;
   $out$0 = $68;
  }
  HEAP32[$66>>2] = $out$0;
  $584 = (($count$0) + -1)|0;
  $585 = ($584|0)==(0);
  if ($585) {
   label = 93;
   break;
  } else {
   $count$0 = $584;
  }
 }
 if ((label|0) == 61) {
  ___assert_fail((2208|0),(1024|0),471,(2240|0));
  // unreachable;
 }
 else if ((label|0) == 93) {
  STACKTOP = sp;return;
 }
}
function __ZN7SPC_DSP11run_counterEi($this,$i) {
 $this = $this|0;
 $i = $i|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $n$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($this) + ($i<<2)|0) + 284|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (($1) + -1)|0;
 $3 = $1 & 7;
 $4 = ($3|0)==(0);
 if ($4) {
  $5 = (($i) + -6)|0;
  $6 = (($5) + ($2))|0;
  $n$0 = $6;
 } else {
  $n$0 = $2;
 }
 HEAP32[$0>>2] = $n$0;
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP11mute_voicesEi($this,$mask) {
 $this = $this|0;
 $mask = $mask|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1560|0);
 HEAP32[$0>>2] = $mask;
 $1 = $mask & 1;
 $2 = (($1) + -1)|0;
 $3 = (($this) + 444|0);
 HEAP32[$3>>2] = $2;
 __ZN7SPC_DSP16update_voice_volEi($this,0);
 $4 = $mask >>> 1;
 $5 = $4 & 1;
 $6 = (($5) + -1)|0;
 $7 = (($this) + 584|0);
 HEAP32[$7>>2] = $6;
 __ZN7SPC_DSP16update_voice_volEi($this,16);
 $8 = $mask >>> 2;
 $9 = $8 & 1;
 $10 = (($9) + -1)|0;
 $11 = (($this) + 724|0);
 HEAP32[$11>>2] = $10;
 __ZN7SPC_DSP16update_voice_volEi($this,32);
 $12 = $mask >>> 3;
 $13 = $12 & 1;
 $14 = (($13) + -1)|0;
 $15 = (($this) + 864|0);
 HEAP32[$15>>2] = $14;
 __ZN7SPC_DSP16update_voice_volEi($this,48);
 $16 = $mask >>> 4;
 $17 = $16 & 1;
 $18 = (($17) + -1)|0;
 $19 = (($this) + 1004|0);
 HEAP32[$19>>2] = $18;
 __ZN7SPC_DSP16update_voice_volEi($this,64);
 $20 = $mask >>> 5;
 $21 = $20 & 1;
 $22 = (($21) + -1)|0;
 $23 = (($this) + 1144|0);
 HEAP32[$23>>2] = $22;
 __ZN7SPC_DSP16update_voice_volEi($this,80);
 $24 = $mask >>> 6;
 $25 = $24 & 1;
 $26 = (($25) + -1)|0;
 $27 = (($this) + 1284|0);
 HEAP32[$27>>2] = $26;
 __ZN7SPC_DSP16update_voice_volEi($this,96);
 $28 = $mask >>> 7;
 $29 = $28 & 1;
 $30 = (($29) + -1)|0;
 $31 = (($this) + 1424|0);
 HEAP32[$31>>2] = $30;
 __ZN7SPC_DSP16update_voice_volEi($this,112);
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP4initEPv($this,$ram_64k) {
 $this = $this|0;
 $ram_64k = $ram_64k|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1556|0);
 HEAP32[$0>>2] = $ram_64k;
 __ZN7SPC_DSP11mute_voicesEi($this,0);
 __ZN7SPC_DSP16disable_surroundEb($this,0);
 __ZN7SPC_DSP10set_outputEPsi($this,0,0);
 __ZN7SPC_DSP5resetEv($this);
 __Z24blargg_verify_byte_orderv();
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP5resetEv($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZN7SPC_DSP4loadEPKh($this,2312);
 STACKTOP = sp;return;
}
function __Z24blargg_verify_byte_orderv() {
 var $0 = 0, $1 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $i = sp;
 HEAP32[$i>>2] = 1;
 $0 = HEAP8[$i>>0]|0;
 $1 = ($0<<24>>24)==(0);
 if ($1) {
  ___assert_fail((2440|0),(2472|0),63,(2496|0));
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function __ZN7SPC_DSP17soft_reset_commonEv($this) {
 $this = $this|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 1556|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  ___assert_fail((2280|0),(1024|0),667,(2288|0));
  // unreachable;
 } else {
  $3 = (($this) + 268|0);
  HEAP32[$3>>2] = 16384;
  $4 = (($this) + 128|0);
  $5 = (($this) + 256|0);
  HEAP32[$5>>2] = $4;
  $6 = (($this) + 260|0);
  HEAP32[$6>>2] = 1;
  $7 = (($this) + 272|0);
  HEAP32[$7>>2] = 0;
  $8 = (($this) + 280|0);
  HEAP32[$8>>2] = 0;
  __ZN7SPC_DSP12init_counterEv($this);
  STACKTOP = sp;return;
 }
}
function __ZN7SPC_DSP12init_counterEv($this) {
 $this = $this|0;
 var $$ = 0, $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $i$02 = 0, $n$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 284|0);
 HEAP32[$0>>2] = 1;
 $1 = (($this) + 288|0);
 HEAP32[$1>>2] = 0;
 $2 = (($this) + 292|0);
 HEAP32[$2>>2] = -32;
 $3 = (($this) + 296|0);
 HEAP32[$3>>2] = 11;
 $i$02 = 1;$n$01 = 2;
 while(1) {
  $4 = ((($this) + ($n$01<<2)|0) + 284|0);
  $5 = ((($this) + ($i$02<<2)|0) + 1428|0);
  HEAP32[$5>>2] = $4;
  $6 = (($n$01) + -1)|0;
  $7 = ($6|0)!=(0);
  $$ = $7 ? $6 : 3;
  $8 = (($i$02) + 1)|0;
  $exitcond = ($8|0)==(32);
  if ($exitcond) {
   break;
  } else {
   $i$02 = $8;$n$01 = $$;
  }
 }
 $9 = (($this) + 1428|0);
 HEAP32[$9>>2] = $0;
 $10 = (($this) + 1548|0);
 HEAP32[$10>>2] = $2;
 STACKTOP = sp;return;
}
function __ZN7SPC_DSP4loadEPKh($this,$regs) {
 $this = $this|0;
 $regs = $regs|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 dest=$this+0|0; src=$regs+0|0; stop=dest+128|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 $0 = (($this) + 128|0);
 _memset(($0|0),0,1428)|0;
 $1 = (($this) + 1396|0);
 HEAP32[$1>>2] = 1;
 $2 = (($this) + 1288|0);
 $3 = (($this) + 1384|0);
 HEAP32[$3>>2] = $2;
 $4 = (($this) + 1256|0);
 HEAP32[$4>>2] = 1;
 $5 = (($this) + 1148|0);
 $6 = (($this) + 1244|0);
 HEAP32[$6>>2] = $5;
 $7 = (($this) + 1116|0);
 HEAP32[$7>>2] = 1;
 $8 = (($this) + 1008|0);
 $9 = (($this) + 1104|0);
 HEAP32[$9>>2] = $8;
 $10 = (($this) + 976|0);
 HEAP32[$10>>2] = 1;
 $11 = (($this) + 868|0);
 $12 = (($this) + 964|0);
 HEAP32[$12>>2] = $11;
 $13 = (($this) + 836|0);
 HEAP32[$13>>2] = 1;
 $14 = (($this) + 728|0);
 $15 = (($this) + 824|0);
 HEAP32[$15>>2] = $14;
 $16 = (($this) + 696|0);
 HEAP32[$16>>2] = 1;
 $17 = (($this) + 588|0);
 $18 = (($this) + 684|0);
 HEAP32[$18>>2] = $17;
 $19 = (($this) + 556|0);
 HEAP32[$19>>2] = 1;
 $20 = (($this) + 448|0);
 $21 = (($this) + 544|0);
 HEAP32[$21>>2] = $20;
 $22 = (($this) + 416|0);
 HEAP32[$22>>2] = 1;
 $23 = (($this) + 308|0);
 $24 = (($this) + 404|0);
 HEAP32[$24>>2] = $23;
 $25 = (($this) + 76|0);
 $26 = HEAP8[$25>>0]|0;
 $27 = $26&255;
 $28 = (($this) + 300|0);
 HEAP32[$28>>2] = $27;
 $29 = (($this) + 1560|0);
 $30 = HEAP32[$29>>2]|0;
 __ZN7SPC_DSP11mute_voicesEi($this,$30);
 __ZN7SPC_DSP17soft_reset_commonEv($this);
 STACKTOP = sp;return;
}
function __ZN10SPC_Filter5clearEv($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($this) + 8|0);
 ;HEAP32[$0+0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;HEAP32[$0+16>>2]=0|0;HEAP32[$0+20>>2]=0|0;
 STACKTOP = sp;return;
}
function __ZN10SPC_FilterC2Ev($this) {
 $this = $this|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[$this>>2] = 256;
 $0 = (($this) + 4|0);
 HEAP32[$0>>2] = 8;
 __ZN10SPC_Filter5clearEv($this);
 STACKTOP = sp;return;
}
function __ZN10SPC_Filter3runEPsi($this,$io,$count) {
 $this = $this|0;
 $io = $io|0;
 $count = $count|0;
 var $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$04 = 0, $i$04$1 = 0, $p1$0$lcssa = 0, $p1$0$lcssa$1 = 0, $p1$03 = 0;
 var $p1$03$1 = 0, $pp1$0$lcssa = 0, $pp1$0$lcssa$1 = 0, $pp1$02 = 0, $pp1$02$1 = 0, $s$0 = 0, $s$0$1 = 0, $sext = 0, $sext$1 = 0, $sum$0$lcssa = 0, $sum$0$lcssa$1 = 0, $sum$01 = 0, $sum$01$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $count & 1;
 $1 = ($0|0)==(0);
 if (!($1)) {
  ___assert_fail((2528|0),(2552|0),31,(2568|0));
  // unreachable;
 }
 $2 = HEAP32[$this>>2]|0;
 $3 = (($this) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($count|0)>(0);
 $6 = (($this) + 28|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($this) + 24|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = (($this) + 20|0);
 $11 = HEAP32[$10>>2]|0;
 if ($5) {
  $i$04 = 0;$p1$03 = $11;$pp1$02 = $9;$sum$01 = $7;
  while(1) {
   $12 = (($io) + ($i$04<<1)|0);
   $13 = HEAP16[$12>>1]|0;
   $14 = $13 << 16 >> 16;
   $15 = (($14) + ($p1$03))|0;
   $16 = ($14*3)|0;
   $17 = (($15) - ($pp1$02))|0;
   $18 = $sum$01 >> 10;
   $19 = Math_imul($17, $2)|0;
   $20 = $sum$01 >> $4;
   $21 = (($sum$01) - ($20))|0;
   $22 = (($21) + ($19))|0;
   $sext = $18 << 16;
   $23 = $sext >> 16;
   $24 = ($23|0)==($18|0);
   if ($24) {
    $s$0 = $18;
   } else {
    $25 = $sum$01 >> 31;
    $26 = $25 ^ 32767;
    $s$0 = $26;
   }
   $27 = $s$0&65535;
   HEAP16[$12>>1] = $27;
   $28 = (($i$04) + 2)|0;
   $29 = ($28|0)<($count|0);
   if ($29) {
    $i$04 = $28;$p1$03 = $16;$pp1$02 = $15;$sum$01 = $22;
   } else {
    $p1$0$lcssa = $16;$pp1$0$lcssa = $15;$sum$0$lcssa = $22;
    break;
   }
  }
 } else {
  $p1$0$lcssa = $11;$pp1$0$lcssa = $9;$sum$0$lcssa = $7;
 }
 HEAP32[$10>>2] = $p1$0$lcssa;
 HEAP32[$8>>2] = $pp1$0$lcssa;
 HEAP32[$6>>2] = $sum$0$lcssa;
 $30 = (($this) + 16|0);
 $31 = HEAP32[$30>>2]|0;
 $32 = (($this) + 12|0);
 $33 = HEAP32[$32>>2]|0;
 $34 = (($this) + 8|0);
 $35 = HEAP32[$34>>2]|0;
 if ($5) {
  $i$04$1 = 0;$p1$03$1 = $35;$pp1$02$1 = $33;$sum$01$1 = $31;
 } else {
  $p1$0$lcssa$1 = $35;$pp1$0$lcssa$1 = $33;$sum$0$lcssa$1 = $31;
  HEAP32[$34>>2] = $p1$0$lcssa$1;
  HEAP32[$32>>2] = $pp1$0$lcssa$1;
  HEAP32[$30>>2] = $sum$0$lcssa$1;
  STACKTOP = sp;return;
 }
 while(1) {
  $$sum9 = $i$04$1 | 1;
  $36 = (($io) + ($$sum9<<1)|0);
  $37 = HEAP16[$36>>1]|0;
  $38 = $37 << 16 >> 16;
  $39 = (($38) + ($p1$03$1))|0;
  $40 = ($38*3)|0;
  $41 = (($39) - ($pp1$02$1))|0;
  $42 = $sum$01$1 >> 10;
  $43 = Math_imul($41, $2)|0;
  $44 = $sum$01$1 >> $4;
  $45 = (($sum$01$1) - ($44))|0;
  $46 = (($45) + ($43))|0;
  $sext$1 = $42 << 16;
  $47 = $sext$1 >> 16;
  $48 = ($47|0)==($42|0);
  if ($48) {
   $s$0$1 = $42;
  } else {
   $49 = $sum$01$1 >> 31;
   $50 = $49 ^ 32767;
   $s$0$1 = $50;
  }
  $51 = $s$0$1&65535;
  HEAP16[$36>>1] = $51;
  $52 = (($i$04$1) + 2)|0;
  $53 = ($52|0)<($count|0);
  if ($53) {
   $i$04$1 = $52;$p1$03$1 = $40;$pp1$02$1 = $39;$sum$01$1 = $46;
  } else {
   $p1$0$lcssa$1 = $40;$pp1$0$lcssa$1 = $39;$sum$0$lcssa$1 = $46;
   break;
  }
 }
 HEAP32[$34>>2] = $p1$0$lcssa$1;
 HEAP32[$32>>2] = $pp1$0$lcssa$1;
 HEAP32[$30>>2] = $sum$0$lcssa$1;
 STACKTOP = sp;return;
}
function __ZdlPv($ptr) {
 $ptr = $ptr|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _free($ptr);
 STACKTOP = sp;return;
}
function __ZNSt9type_infoD2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv116__shim_type_infoD2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop1Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv116__shim_type_info5noop2Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv117__class_type_infoD0Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZdlPv($this);
 STACKTOP = sp;return;
}
function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this) {
 $this = $this|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 __ZdlPv($this);
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this,$thrown_type,$adjustedPtr) {
 $this = $this|0;
 $thrown_type = $thrown_type|0;
 $adjustedPtr = $adjustedPtr|0;
 var $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $info = 0, dest = 0, label = 0;
 var sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $info = sp;
 $0 = ($this|0)==($thrown_type|0);
 if ($0) {
  $$1 = 1;
  STACKTOP = sp;return ($$1|0);
 }
 $1 = ($thrown_type|0)==(0|0);
 if ($1) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 $2 = (___dynamic_cast($thrown_type,2640,2696,0)|0);
 $3 = ($2|0)==(0|0);
 if ($3) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 dest=$info+0|0; stop=dest+56|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 HEAP32[$info>>2] = $2;
 $4 = (($info) + 8|0);
 HEAP32[$4>>2] = $this;
 $5 = (($info) + 12|0);
 HEAP32[$5>>2] = -1;
 $6 = (($info) + 48|0);
 HEAP32[$6>>2] = 1;
 $7 = HEAP32[$2>>2]|0;
 $8 = (($7) + 28|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = HEAP32[$adjustedPtr>>2]|0;
 FUNCTION_TABLE_viiii[$9 & 3]($2,$info,$10,1);
 $11 = (($info) + 24|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==(1);
 if (!($13)) {
  $$1 = 0;
  STACKTOP = sp;return ($$1|0);
 }
 $14 = (($info) + 16|0);
 $15 = HEAP32[$14>>2]|0;
 HEAP32[$adjustedPtr>>2] = $15;
 $$1 = 1;
 STACKTOP = sp;return ($$1|0);
}
function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 16|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  HEAP32[$0>>2] = $adjustedPtr;
  $3 = (($info) + 24|0);
  HEAP32[$3>>2] = $path_below;
  $4 = (($info) + 36|0);
  HEAP32[$4>>2] = 1;
  STACKTOP = sp;return;
 }
 $5 = ($1|0)==($adjustedPtr|0);
 if (!($5)) {
  $9 = (($info) + 36|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = (($10) + 1)|0;
  HEAP32[$9>>2] = $11;
  $12 = (($info) + 24|0);
  HEAP32[$12>>2] = 2;
  $13 = (($info) + 54|0);
  HEAP8[$13>>0] = 1;
  STACKTOP = sp;return;
 }
 $6 = (($info) + 24|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)==(2);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 HEAP32[$6>>2] = $path_below;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0,$info,$adjustedPtr,$path_below);
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this,$info,$adjustedPtr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $adjustedPtr = $adjustedPtr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi(0,$info,$adjustedPtr,$path_below);
  STACKTOP = sp;return;
 } else {
  $3 = (($this) + 8|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = HEAP32[$4>>2]|0;
  $6 = (($5) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  FUNCTION_TABLE_viiii[$7 & 3]($4,$info,$adjustedPtr,$path_below);
  STACKTOP = sp;return;
 }
}
function ___dynamic_cast($static_ptr,$static_type,$dst_type,$src2dst_offset) {
 $static_ptr = $static_ptr|0;
 $static_type = $static_type|0;
 $dst_type = $dst_type|0;
 $src2dst_offset = $src2dst_offset|0;
 var $$ = 0, $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $dst_ptr$0 = 0, $info = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $info = sp;
 $0 = HEAP32[$static_ptr>>2]|0;
 $1 = (($0) + -8|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = $2;
 $4 = (($static_ptr) + ($3)|0);
 $5 = (($0) + -4|0);
 $6 = HEAP32[$5>>2]|0;
 HEAP32[$info>>2] = $dst_type;
 $7 = (($info) + 4|0);
 HEAP32[$7>>2] = $static_ptr;
 $8 = (($info) + 8|0);
 HEAP32[$8>>2] = $static_type;
 $9 = (($info) + 12|0);
 HEAP32[$9>>2] = $src2dst_offset;
 $10 = (($info) + 16|0);
 $11 = (($info) + 20|0);
 $12 = (($info) + 24|0);
 $13 = (($info) + 28|0);
 $14 = (($info) + 32|0);
 $15 = (($info) + 40|0);
 $16 = ($6|0)==($dst_type|0);
 dest=$10+0|0; stop=dest+36|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));HEAP16[$10+36>>1]=0|0;HEAP8[$10+38>>0]=0|0;
 if ($16) {
  $17 = (($info) + 48|0);
  HEAP32[$17>>2] = 1;
  $18 = HEAP32[$6>>2]|0;
  $19 = (($18) + 20|0);
  $20 = HEAP32[$19>>2]|0;
  FUNCTION_TABLE_viiiiii[$20 & 3]($6,$info,$4,$4,1,0);
  $21 = HEAP32[$12>>2]|0;
  $22 = ($21|0)==(1);
  $$ = $22 ? $4 : 0;
  $dst_ptr$0 = $$;
  STACKTOP = sp;return ($dst_ptr$0|0);
 }
 $23 = (($info) + 36|0);
 $24 = HEAP32[$6>>2]|0;
 $25 = (($24) + 24|0);
 $26 = HEAP32[$25>>2]|0;
 FUNCTION_TABLE_viiiii[$26 & 3]($6,$info,$4,1,0);
 $27 = HEAP32[$23>>2]|0;
 if ((($27|0) == 1)) {
  $35 = HEAP32[$12>>2]|0;
  $36 = ($35|0)==(1);
  if (!($36)) {
   $37 = HEAP32[$15>>2]|0;
   $38 = ($37|0)==(0);
   if (!($38)) {
    $dst_ptr$0 = 0;
    STACKTOP = sp;return ($dst_ptr$0|0);
   }
   $39 = HEAP32[$13>>2]|0;
   $40 = ($39|0)==(1);
   if (!($40)) {
    $dst_ptr$0 = 0;
    STACKTOP = sp;return ($dst_ptr$0|0);
   }
   $41 = HEAP32[$14>>2]|0;
   $42 = ($41|0)==(1);
   if (!($42)) {
    $dst_ptr$0 = 0;
    STACKTOP = sp;return ($dst_ptr$0|0);
   }
  }
  $43 = HEAP32[$10>>2]|0;
  $dst_ptr$0 = $43;
  STACKTOP = sp;return ($dst_ptr$0|0);
 } else if ((($27|0) == 0)) {
  $28 = HEAP32[$15>>2]|0;
  $29 = ($28|0)==(1);
  if (!($29)) {
   $dst_ptr$0 = 0;
   STACKTOP = sp;return ($dst_ptr$0|0);
  }
  $30 = HEAP32[$13>>2]|0;
  $31 = ($30|0)==(1);
  if (!($31)) {
   $dst_ptr$0 = 0;
   STACKTOP = sp;return ($dst_ptr$0|0);
  }
  $32 = HEAP32[$14>>2]|0;
  $33 = ($32|0)==(1);
  $34 = HEAP32[$11>>2]|0;
  $$1 = $33 ? $34 : 0;
  $dst_ptr$0 = $$1;
  STACKTOP = sp;return ($dst_ptr$0|0);
 } else {
  $dst_ptr$0 = 0;
  STACKTOP = sp;return ($dst_ptr$0|0);
 }
 return 0|0;
}
function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this,$info,$dst_ptr,$current_ptr,$path_below) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 53|0);
 HEAP8[$0>>0] = 1;
 $1 = (($info) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)==($current_ptr|0);
 if (!($3)) {
  STACKTOP = sp;return;
 }
 $4 = (($info) + 52|0);
 HEAP8[$4>>0] = 1;
 $5 = (($info) + 16|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($6|0)==(0|0);
 if ($7) {
  HEAP32[$5>>2] = $dst_ptr;
  $8 = (($info) + 24|0);
  HEAP32[$8>>2] = $path_below;
  $9 = (($info) + 36|0);
  HEAP32[$9>>2] = 1;
  $10 = (($info) + 48|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = ($11|0)==(1);
  $13 = ($path_below|0)==(1);
  $or$cond = $12 & $13;
  if (!($or$cond)) {
   STACKTOP = sp;return;
  }
  $14 = (($info) + 54|0);
  HEAP8[$14>>0] = 1;
  STACKTOP = sp;return;
 }
 $15 = ($6|0)==($dst_ptr|0);
 if (!($15)) {
  $25 = (($info) + 36|0);
  $26 = HEAP32[$25>>2]|0;
  $27 = (($26) + 1)|0;
  HEAP32[$25>>2] = $27;
  $28 = (($info) + 54|0);
  HEAP8[$28>>0] = 1;
  STACKTOP = sp;return;
 }
 $16 = (($info) + 24|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = ($17|0)==(2);
 if ($18) {
  HEAP32[$16>>2] = $path_below;
  $22 = $path_below;
 } else {
  $22 = $17;
 }
 $19 = (($info) + 48|0);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(1);
 $23 = ($22|0)==(1);
 $or$cond1 = $21 & $23;
 if (!($or$cond1)) {
  STACKTOP = sp;return;
 }
 $24 = (($info) + 54|0);
 HEAP8[$24>>0] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $is_dst_type_derived_from_static_type$0$off01 = 0, $not$ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  $3 = (($info) + 4|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==($current_ptr|0);
  if (!($5)) {
   STACKTOP = sp;return;
  }
  $6 = (($info) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(1);
  if ($8) {
   STACKTOP = sp;return;
  }
  HEAP32[$6>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$info>>2]|0;
 $10 = ($this|0)==($9|0);
 if (!($10)) {
  $43 = (($this) + 8|0);
  $44 = HEAP32[$43>>2]|0;
  $45 = HEAP32[$44>>2]|0;
  $46 = (($45) + 24|0);
  $47 = HEAP32[$46>>2]|0;
  FUNCTION_TABLE_viiiii[$47 & 3]($44,$info,$current_ptr,$path_below,$use_strcmp);
  STACKTOP = sp;return;
 }
 $11 = (($info) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==($current_ptr|0);
 if (!($13)) {
  $14 = (($info) + 20|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($15|0)==($current_ptr|0);
  if (!($16)) {
   $19 = (($info) + 32|0);
   HEAP32[$19>>2] = $path_below;
   $20 = (($info) + 44|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = ($21|0)==(4);
   if ($22) {
    STACKTOP = sp;return;
   }
   $23 = (($info) + 52|0);
   HEAP8[$23>>0] = 0;
   $24 = (($info) + 53|0);
   HEAP8[$24>>0] = 0;
   $25 = (($this) + 8|0);
   $26 = HEAP32[$25>>2]|0;
   $27 = HEAP32[$26>>2]|0;
   $28 = (($27) + 20|0);
   $29 = HEAP32[$28>>2]|0;
   FUNCTION_TABLE_viiiiii[$29 & 3]($26,$info,$current_ptr,$current_ptr,1,$use_strcmp);
   $30 = HEAP8[$24>>0]|0;
   $31 = ($30<<24>>24)==(0);
   if ($31) {
    $is_dst_type_derived_from_static_type$0$off01 = 0;
    label = 13;
   } else {
    $32 = HEAP8[$23>>0]|0;
    $not$ = ($32<<24>>24)==(0);
    if ($not$) {
     $is_dst_type_derived_from_static_type$0$off01 = 1;
     label = 13;
    }
   }
   do {
    if ((label|0) == 13) {
     HEAP32[$14>>2] = $current_ptr;
     $33 = (($info) + 40|0);
     $34 = HEAP32[$33>>2]|0;
     $35 = (($34) + 1)|0;
     HEAP32[$33>>2] = $35;
     $36 = (($info) + 36|0);
     $37 = HEAP32[$36>>2]|0;
     $38 = ($37|0)==(1);
     if ($38) {
      $39 = (($info) + 24|0);
      $40 = HEAP32[$39>>2]|0;
      $41 = ($40|0)==(2);
      if ($41) {
       $42 = (($info) + 54|0);
       HEAP8[$42>>0] = 1;
       if ($is_dst_type_derived_from_static_type$0$off01) {
        break;
       }
      } else {
       label = 16;
      }
     } else {
      label = 16;
     }
     if ((label|0) == 16) {
      if ($is_dst_type_derived_from_static_type$0$off01) {
       break;
      }
     }
     HEAP32[$20>>2] = 4;
     STACKTOP = sp;return;
    }
   } while(0);
   HEAP32[$20>>2] = 3;
   STACKTOP = sp;return;
  }
 }
 $17 = ($path_below|0)==(1);
 if (!($17)) {
  STACKTOP = sp;return;
 }
 $18 = (($info) + 32|0);
 HEAP32[$18>>2] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib($this,$info,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if ($2) {
  $3 = (($info) + 4|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = ($4|0)==($current_ptr|0);
  if (!($5)) {
   STACKTOP = sp;return;
  }
  $6 = (($info) + 28|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(1);
  if ($8) {
   STACKTOP = sp;return;
  }
  HEAP32[$6>>2] = $path_below;
  STACKTOP = sp;return;
 }
 $9 = HEAP32[$info>>2]|0;
 $10 = ($9|0)==($this|0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = (($info) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==($current_ptr|0);
 if (!($13)) {
  $14 = (($info) + 20|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($15|0)==($current_ptr|0);
  if (!($16)) {
   $19 = (($info) + 32|0);
   HEAP32[$19>>2] = $path_below;
   HEAP32[$14>>2] = $current_ptr;
   $20 = (($info) + 40|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = (($21) + 1)|0;
   HEAP32[$20>>2] = $22;
   $23 = (($info) + 36|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = ($24|0)==(1);
   if ($25) {
    $26 = (($info) + 24|0);
    $27 = HEAP32[$26>>2]|0;
    $28 = ($27|0)==(2);
    if ($28) {
     $29 = (($info) + 54|0);
     HEAP8[$29>>0] = 1;
    }
   }
   $30 = (($info) + 44|0);
   HEAP32[$30>>2] = 4;
   STACKTOP = sp;return;
  }
 }
 $17 = ($path_below|0)==(1);
 if (!($17)) {
  STACKTOP = sp;return;
 }
 $18 = (($info) + 32|0);
 HEAP32[$18>>2] = 1;
 STACKTOP = sp;return;
}
function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($this|0)==($1|0);
 if ($2) {
  __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0,$info,$dst_ptr,$current_ptr,$path_below);
  STACKTOP = sp;return;
 } else {
  $3 = (($this) + 8|0);
  $4 = HEAP32[$3>>2]|0;
  $5 = HEAP32[$4>>2]|0;
  $6 = (($5) + 20|0);
  $7 = HEAP32[$6>>2]|0;
  FUNCTION_TABLE_viiiiii[$7 & 3]($4,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp);
  STACKTOP = sp;return;
 }
}
function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib($this,$info,$dst_ptr,$current_ptr,$path_below,$use_strcmp) {
 $this = $this|0;
 $info = $info|0;
 $dst_ptr = $dst_ptr|0;
 $current_ptr = $current_ptr|0;
 $path_below = $path_below|0;
 $use_strcmp = $use_strcmp|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($info) + 8|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($this|0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i(0,$info,$dst_ptr,$current_ptr,$path_below);
 STACKTOP = sp;return;
}
function ___cxa_can_catch($catchType,$excpType,$thrown) {
 $catchType = $catchType|0;
 $excpType = $excpType|0;
 $thrown = $thrown|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $temp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $temp = sp;
 $0 = HEAP32[$thrown>>2]|0;
 HEAP32[$temp>>2] = $0;
 $1 = HEAP32[$catchType>>2]|0;
 $2 = (($1) + 16|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (FUNCTION_TABLE_iiii[$3 & 1]($catchType,$excpType,$temp)|0);
 $5 = $4&1;
 if (!($4)) {
  STACKTOP = sp;return ($5|0);
 }
 $6 = HEAP32[$temp>>2]|0;
 HEAP32[$thrown>>2] = $6;
 STACKTOP = sp;return ($5|0);
}
function ___cxa_is_pointer_type($type) {
 $type = $type|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $phitmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($type|0)==(0|0);
 if ($0) {
  $3 = 0;
 } else {
  $1 = (___dynamic_cast($type,2640,2808,0)|0);
  $phitmp = ($1|0)!=(0|0);
  $3 = $phitmp;
 }
 $2 = $3&1;
 STACKTOP = sp;return ($2|0);
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[2960>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((2960 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((2960 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[2960>>2] = $22;
     } else {
      $23 = HEAP32[((2960 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((2960 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((2960 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((2960 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[2960>>2] = $74;
      } else {
       $75 = HEAP32[((2960 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((2960 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((2960 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((2960 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[2960>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[2960>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((2960 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((2960 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((2960 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((2960 + 8|0))>>2] = $81;
     HEAP32[((2960 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((2960 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((2960 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((2960 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((2960 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((2960 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((2960 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((2960 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((2960 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((2960 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((2960 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((2960 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((2960 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((2960 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[2960>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[2960>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((2960 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((2960 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((2960 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((2960 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((2960 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((2960 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((2960 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((2960 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((2960 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((2960 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((2960 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((2960 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((2960 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((2960 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((2960 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((2960 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((2960 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((2960 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[2960>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          do {
           if ($431) {
            $432 = $428 | $429;
            HEAP32[2960>>2] = $432;
            $$sum14$pre$i = (($426) + 2)|0;
            $$pre$i25 = ((2960 + ($$sum14$pre$i<<2)|0) + 40|0);
            $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
           } else {
            $$sum17$i = (($426) + 2)|0;
            $433 = ((2960 + ($$sum17$i<<2)|0) + 40|0);
            $434 = HEAP32[$433>>2]|0;
            $435 = HEAP32[((2960 + 16|0))>>2]|0;
            $436 = ($434>>>0)<($435>>>0);
            if (!($436)) {
             $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((2960 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((2960 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((2960 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((2960 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((2960 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((2960 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((2960 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((2960 + 20|0))>>2] = $516;
   HEAP32[((2960 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((2960 + 8|0))>>2] = 0;
   HEAP32[((2960 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((2960 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((2960 + 12|0))>>2] = $530;
  $531 = HEAP32[((2960 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((2960 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[3432>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((3432 + 8|0))>>2] = $540;
    HEAP32[((3432 + 4|0))>>2] = $540;
    HEAP32[((3432 + 12|0))>>2] = -1;
    HEAP32[((3432 + 16|0))>>2] = -1;
    HEAP32[((3432 + 20|0))>>2] = 0;
    HEAP32[((2960 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[3432>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((3432 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((2960 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((2960 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((2960 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((2960 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((2960 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((2960 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((3432 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((2960 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((2960 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((3432 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((2960 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((2960 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((2960 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((2960 + 432|0))>>2] = $633;
  $634 = HEAP32[((2960 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((2960 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((2960 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((2960 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((2960 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((2960 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((2960 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((2960 + 460|0))>>2] = 0;
    $641 = HEAP32[3432>>2]|0;
    HEAP32[((2960 + 36|0))>>2] = $641;
    HEAP32[((2960 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((2960 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((2960 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((2960 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((2960 + 24|0))>>2] = $654;
    HEAP32[((2960 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((3432 + 16|0))>>2]|0;
    HEAP32[((2960 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((2960 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((2960 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((2960 + 24|0))>>2] = $684;
       HEAP32[((2960 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((3432 + 16|0))>>2]|0;
       HEAP32[((2960 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((2960 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((2960 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((2960 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((2960 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L338: do {
       if ($730) {
        $731 = HEAP32[((2960 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((2960 + 12|0))>>2] = $732;
        HEAP32[((2960 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((2960 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((2960 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((2960 + 8|0))>>2] = $738;
         HEAP32[((2960 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         L346: do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((2960 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           do {
            if (!($755)) {
             $756 = HEAP32[((2960 + 16|0))>>2]|0;
             $757 = ($750>>>0)<($756>>>0);
             if ($757) {
              _abort();
              // unreachable;
             }
             $758 = (($750) + 12|0);
             $759 = HEAP32[$758>>2]|0;
             $760 = ($759|0)==($721|0);
             if ($760) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[2960>>2]|0;
            $765 = $764 & $763;
            HEAP32[2960>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           do {
            if ($766) {
             $$pre57$i$i = (($752) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $767 = HEAP32[((2960 + 16|0))>>2]|0;
             $768 = ($752>>>0)<($767>>>0);
             if ($768) {
              _abort();
              // unreachable;
             }
             $769 = (($752) + 8|0);
             $770 = HEAP32[$769>>2]|0;
             $771 = ($770|0)==($721|0);
             if ($771) {
              $$pre$phi58$i$iZ2D = $769;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((2960 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((2960 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if ($802) {
            break;
           }
           $$sum30$i$i = (($tsize$246$i) + 28)|0;
           $$sum113$i = (($$sum30$i$i) + ($720))|0;
           $803 = (($tbase$247$i) + ($$sum113$i)|0);
           $804 = HEAP32[$803>>2]|0;
           $805 = ((2960 + ($804<<2)|0) + 304|0);
           $806 = HEAP32[$805>>2]|0;
           $807 = ($721|0)==($806|0);
           do {
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $808 = 1 << $804;
             $809 = $808 ^ -1;
             $810 = HEAP32[((2960 + 4|0))>>2]|0;
             $811 = $810 & $809;
             HEAP32[((2960 + 4|0))>>2] = $811;
             break L346;
            } else {
             $812 = HEAP32[((2960 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break L346;
             }
            }
           } while(0);
           $819 = HEAP32[((2960 + 16|0))>>2]|0;
           $820 = ($R$1$i$i>>>0)<($819>>>0);
           if ($820) {
            _abort();
            // unreachable;
           }
           $821 = (($R$1$i$i) + 24|0);
           HEAP32[$821>>2] = $774;
           $$sum3132$i$i = $720 | 16;
           $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
           $822 = (($tbase$247$i) + ($$sum114$i)|0);
           $823 = HEAP32[$822>>2]|0;
           $824 = ($823|0)==(0|0);
           do {
            if (!($824)) {
             $825 = HEAP32[((2960 + 16|0))>>2]|0;
             $826 = ($823>>>0)<($825>>>0);
             if ($826) {
              _abort();
              // unreachable;
             } else {
              $827 = (($R$1$i$i) + 16|0);
              HEAP32[$827>>2] = $823;
              $828 = (($823) + 24|0);
              HEAP32[$828>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
           $829 = (($tbase$247$i) + ($$sum115$i)|0);
           $830 = HEAP32[$829>>2]|0;
           $831 = ($830|0)==(0|0);
           if ($831) {
            break;
           }
           $832 = HEAP32[((2960 + 16|0))>>2]|0;
           $833 = ($830>>>0)<($832>>>0);
           if ($833) {
            _abort();
            // unreachable;
           } else {
            $834 = (($R$1$i$i) + 20|0);
            HEAP32[$834>>2] = $830;
            $835 = (($830) + 24|0);
            HEAP32[$835>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((2960 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[2960>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         do {
          if ($851) {
           $852 = $848 | $849;
           HEAP32[2960>>2] = $852;
           $$sum26$pre$i$i = (($846) + 2)|0;
           $$pre$i25$i = ((2960 + ($$sum26$pre$i$i<<2)|0) + 40|0);
           $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
          } else {
           $$sum29$i$i = (($846) + 2)|0;
           $853 = ((2960 + ($$sum29$i$i<<2)|0) + 40|0);
           $854 = HEAP32[$853>>2]|0;
           $855 = HEAP32[((2960 + 16|0))>>2]|0;
           $856 = ($854>>>0)<($855>>>0);
           if (!($856)) {
            $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        do {
         if ($861) {
          $I7$0$i$i = 0;
         } else {
          $862 = ($qsize$0$i$i>>>0)>(16777215);
          if ($862) {
           $I7$0$i$i = 31;
           break;
          }
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        } while(0);
        $885 = ((2960 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((2960 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((2960 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L435: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L435;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((2960 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L338;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((2960 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((2960 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((2960 + 24|0))>>2] = $958;
    HEAP32[((2960 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((3432 + 16|0))>>2]|0;
    HEAP32[((2960 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((2960 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((2960 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((2960 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((2960 + 448|0))+12>>2]|0;
    HEAP32[((2960 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((2960 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((2960 + 460|0))>>2] = 0;
    HEAP32[((2960 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((2960 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[2960>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      do {
       if ($990) {
        $991 = $987 | $988;
        HEAP32[2960>>2] = $991;
        $$sum10$pre$i$i = (($985) + 2)|0;
        $$pre$i$i = ((2960 + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
       } else {
        $$sum11$i$i = (($985) + 2)|0;
        $992 = ((2960 + ($$sum11$i$i<<2)|0) + 40|0);
        $993 = HEAP32[$992>>2]|0;
        $994 = HEAP32[((2960 + 16|0))>>2]|0;
        $995 = ($993>>>0)<($994>>>0);
        if (!($995)) {
         $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((2960 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((2960 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((2960 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L489: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L489;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((2960 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((2960 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((2960 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((2960 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((2960 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((2960 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((2960 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((2960 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((2960 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((2960 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[2960>>2]|0;
     $36 = $35 & $34;
     HEAP32[2960>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((2960 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((2960 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((2960 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((2960 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((2960 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((2960 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((2960 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((2960 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((2960 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((2960 + 12|0))>>2] = $122;
   HEAP32[((2960 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((2960 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((2960 + 20|0))>>2] = 0;
   HEAP32[((2960 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((2960 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((2960 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((2960 + 8|0))>>2] = $130;
   HEAP32[((2960 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((2960 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((2960 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[2960>>2]|0;
     $154 = $153 & $152;
     HEAP32[2960>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((2960 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((2960 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((2960 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((2960 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((2960 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((2960 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((2960 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((2960 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((2960 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((2960 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((2960 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((2960 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((2960 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[2960>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[2960>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((2960 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((2960 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((2960 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((2960 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((2960 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((2960 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((2960 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((2960 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((2960 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((2960 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((2960 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((2960 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _memcmp($vl,$vr,$n) {
 $vl = $vl|0;
 $vr = $vr|0;
 $n = $n|0;
 var $$03 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $l$04 = 0, $r$05 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($n|0)==(0);
 L1: do {
  if ($0) {
   $11 = 0;
  } else {
   $$03 = $n;$l$04 = $vl;$r$05 = $vr;
   while(1) {
    $1 = HEAP8[$l$04>>0]|0;
    $2 = HEAP8[$r$05>>0]|0;
    $3 = ($1<<24>>24)==($2<<24>>24);
    if (!($3)) {
     break;
    }
    $4 = (($$03) + -1)|0;
    $5 = (($l$04) + 1|0);
    $6 = (($r$05) + 1|0);
    $7 = ($4|0)==(0);
    if ($7) {
     $11 = 0;
     break L1;
    } else {
     $$03 = $4;$l$04 = $5;$r$05 = $6;
    }
   }
   $8 = $1&255;
   $9 = $2&255;
   $10 = (($8) - ($9))|0;
   $11 = $10;
  }
 } while(0);
 STACKTOP = sp;return ($11|0);
}
function runPostSets() {
 
}
function _memcpy(dest, src, num) {

    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _memmove(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
      // Unlikely case: Copy backwards in a safe manner
      ret = dest;
      src = (src + num)|0;
      dest = (dest + num)|0;
      while ((num|0) > 0) {
        dest = (dest - 1)|0;
        src = (src - 1)|0;
        num = (num - 1)|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      }
      dest = ret;
    } else {
      _memcpy(dest, src, num) | 0;
    }
    return dest | 0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}

// EMSCRIPTEN_END_FUNCS

    
    function dynCall_iiii(index,a1,a2,a3) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0;
      return FUNCTION_TABLE_iiii[index&1](a1|0,a2|0,a3|0)|0;
    }
  

    function dynCall_vi(index,a1) {
      index = index|0;
      a1=a1|0;
      FUNCTION_TABLE_vi[index&7](a1|0);
    }
  

    function dynCall_viiiiii(index,a1,a2,a3,a4,a5,a6) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
      FUNCTION_TABLE_viiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
    }
  

    function dynCall_viiiii(index,a1,a2,a3,a4,a5) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
      FUNCTION_TABLE_viiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0);
    }
  

    function dynCall_viiii(index,a1,a2,a3,a4) {
      index = index|0;
      a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
      FUNCTION_TABLE_viiii[index&3](a1|0,a2|0,a3|0,a4|0);
    }
  
function b0(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; abort(0);return 0; }
  function b1(p0) { p0 = p0|0; abort(1); }
  function b2(p0,p1,p2,p3,p4,p5) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0; abort(2); }
  function b3(p0,p1,p2,p3,p4) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; abort(3); }
  function b4(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; abort(4); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_iiii = [b0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv];
  var FUNCTION_TABLE_vi = [b1,__ZN10__cxxabiv116__shim_type_infoD2Ev,__ZN10__cxxabiv117__class_type_infoD0Ev,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,__ZN10__cxxabiv120__si_class_type_infoD0Ev,b1,b1];
  var FUNCTION_TABLE_viiiiii = [b2,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,b2];
  var FUNCTION_TABLE_viiiii = [b3,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,b3];
  var FUNCTION_TABLE_viiii = [b4,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,b4];

    return { ___cxa_can_catch: ___cxa_can_catch, _spc_set_output: _spc_set_output, _free: _free, _memcpy: _memcpy, _spc_set_tempo: _spc_set_tempo, _spc_filter_clear: _spc_filter_clear, ___cxa_is_pointer_type: ___cxa_is_pointer_type, _spc_filter_run: _spc_filter_run, _strlen: _strlen, _memset: _memset, _malloc: _malloc, _spc_filter_new: _spc_filter_new, _memmove: _memmove, _spc_play: _spc_play, _spc_new: _spc_new, _spc_load_spc: _spc_load_spc, _spc_clear_echo: _spc_clear_echo, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_iiii: dynCall_iiii, dynCall_vi: dynCall_vi, dynCall_viiiiii: dynCall_viiiiii, dynCall_viiiii: dynCall_viiiii, dynCall_viiii: dynCall_viiii };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_iiii": invoke_iiii, "invoke_vi": invoke_vi, "invoke_viiiiii": invoke_viiiiii, "invoke_viiiii": invoke_viiiii, "invoke_viiii": invoke_viiii, "_fflush": _fflush, "_sysconf": _sysconf, "_abort": _abort, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_time": _time, "_emscripten_memcpy_big": _emscripten_memcpy_big, "___assert_fail": ___assert_fail, "___errno_location": ___errno_location, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
  var ___cxa_can_catch = Module["___cxa_can_catch"] = asm["___cxa_can_catch"];
var _spc_set_output = Module["_spc_set_output"] = asm["_spc_set_output"];
var _free = Module["_free"] = asm["_free"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _spc_set_tempo = Module["_spc_set_tempo"] = asm["_spc_set_tempo"];
var _spc_filter_clear = Module["_spc_filter_clear"] = asm["_spc_filter_clear"];
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = asm["___cxa_is_pointer_type"];
var _spc_filter_run = Module["_spc_filter_run"] = asm["_spc_filter_run"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _spc_filter_new = Module["_spc_filter_new"] = asm["_spc_filter_new"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _spc_play = Module["_spc_play"] = asm["_spc_play"];
var _spc_new = Module["_spc_new"] = asm["_spc_new"];
var _spc_load_spc = Module["_spc_load_spc"] = asm["_spc_load_spc"];
var _spc_clear_echo = Module["_spc_clear_echo"] = asm["_spc_clear_echo"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  if (Module['noExitRuntime']) {
    return;
  }

  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



