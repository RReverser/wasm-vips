import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript';
import 'monaco-editor/esm/vs/basic-languages/html/html';
import 'monaco-editor/esm/vs/basic-languages/css/css';

import { playSamples } from './samples';
import './css/playground.css';

const isMac = /Mac/i.test(navigator.userAgent);

let editor = null;
const data = {
  js: {
    model: null,
    state: null
  },
  css: {
    model: null,
    state: null
  },
  html: {
    model: null,
    state: null
  }
};

let runIframe = null;
let vipsInitialized = false;

function load () {
  function layout () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const innerPadding = 15 * 2;

    const titleHeight = 60;
    const switcherHeight = 30;
    const tabsHeight = 20;
    const footerHeight = 110;

    const minContainerWidth = 250;
    const minContainerHeight = 350;

    const containerWidth = Math.max(minContainerWidth, Math.floor(width / 2) - innerPadding);
    const containerHeight = Math.max(minContainerHeight, height - titleHeight - switcherHeight - tabsHeight - footerHeight - innerPadding);

    tabArea.style.boxSizing = 'border-box';
    tabArea.style.height = tabsHeight + 'px';

    editorContainer.style.boxSizing = 'border-box';
    editorContainer.style.width = containerWidth + 'px';
    editorContainer.style.height = containerHeight + 'px';

    if (editor) {
      editor.layout({
        width: containerWidth - 2,
        height: containerHeight - 1
      });
    }
  }

  function changeTab (selectedTabNode, desiredModelId) {
    for (let i = 0; i < tabArea.childNodes.length; i++) {
      const child = tabArea.childNodes[i];
      if (/tab/.test(child.className)) {
        child.className = 'tab';
      }
    }
    selectedTabNode.className = 'tab active';

    const currentState = editor.saveViewState();

    const currentModel = editor.getModel();
    if (currentModel === data.js.model) {
      data.js.state = currentState;
    } else if (currentModel === data.css.model) {
      data.css.state = currentState;
    } else if (currentModel === data.html.model) {
      data.html.state = currentState;
    }

    editor.setModel(data[desiredModelId].model);
    editor.restoreViewState(data[desiredModelId].state);
    editor.focus();
  }

  // create the typing side
  const typingContainer = document.createElement('div');
  typingContainer.className = 'typing-container';

  const tabArea = document.createElement('div');
  tabArea.className = 'tab-area';

  const jsTab = document.createElement('span');
  jsTab.className = 'tab active';
  jsTab.appendChild(document.createTextNode('JavaScript'));
  jsTab.onclick = function () {
    changeTab(jsTab, 'js');
  };
  tabArea.appendChild(jsTab);

  const cssTab = document.createElement('span');
  cssTab.className = 'tab';
  cssTab.appendChild(document.createTextNode('CSS'));
  cssTab.onclick = function () {
    changeTab(cssTab, 'css');
  };
  tabArea.appendChild(cssTab);

  const htmlTab = document.createElement('span');
  htmlTab.className = 'tab';
  htmlTab.appendChild(document.createTextNode('HTML'));
  htmlTab.onclick = function () {
    changeTab(htmlTab, 'html');
  };
  tabArea.appendChild(htmlTab);

  const runLabel = 'Press ' + (isMac ? 'CMD + return' : 'CTRL + Enter') + ' to run the code.';
  const runBtn = document.createElement('button');
  runBtn.className = 'action run';
  runBtn.setAttribute('role', 'button');
  runBtn.setAttribute('aria-label', runLabel);
  runBtn.appendChild(document.createTextNode('Run'));
  runBtn.onclick = function () {
    run();
  };
  tabArea.appendChild(runBtn);

  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';

  typingContainer.appendChild(tabArea);
  typingContainer.appendChild(editorContainer);

  const runContainer = document.createElement('div');
  runContainer.className = 'run-container';

  const sampleSwitcher = document.getElementById('sample-switcher');
  let sampleChapter;
  playSamples.forEach(function (sample) {
    if (!sampleChapter || sampleChapter.label !== sample.chapter) {
      sampleChapter = document.createElement('optgroup');
      sampleChapter.label = sample.chapter;
      sampleChapter.label = sample.chapter;
      sampleSwitcher.appendChild(sampleChapter);
    }
    const sampleOption = document.createElement('option');
    sampleOption.value = sample.id;
    sampleOption.appendChild(document.createTextNode(sample.name));
    sampleChapter.appendChild(sampleOption);
  });

  const loadedSamples = [];

  function findLoadedSample (sampleId) {
    for (let i = 0; i < loadedSamples.length; i++) {
      const sample = loadedSamples[i];
      if (sample.id === sampleId) {
        return sample;
      }
    }
    return null;
  }

  function findSamplePath (sampleId) {
    for (let i = 0; i < playSamples.length; i++) {
      const sample = playSamples[i];
      if (sample.id === sampleId) {
        return sample.path;
      }
    }
    return null;
  }

  function loadSample (sampleId, callback) {
    const sample = findLoadedSample(sampleId);
    if (sample) {
      return callback(null, sample);
    }

    let samplePath = findSamplePath(sampleId);
    if (!samplePath) {
      return callback(new Error('sample not found'));
    }

    samplePath = 'samples/' + samplePath;

    const js = xhr(samplePath + '/sample.js').then(function (response) {
      return response.responseText;
    });
    const css = xhr(samplePath + '/sample.css').then(function (response) {
      return response.responseText;
    });
    const html = xhr(samplePath + '/sample.html').then(function (response) {
      return response.responseText;
    });
    Promise.all([js, css, html]).then(function (_) {
      const js = _[0];
      const css = _[1];
      const html = _[2];
      loadedSamples.push({
        id: sampleId,
        js: js,
        css: css,
        html: html
      });
      return callback(null, findLoadedSample(sampleId));
    }, function (err) {
      callback(err, null);
    });
  }

  sampleSwitcher.onchange = function () {
    window.location.hash = sampleSwitcher.options[sampleSwitcher.selectedIndex].value;
  };

  const playgroundContainer = document.getElementById('playground');

  layout();
  window.onresize = layout;

  playgroundContainer.appendChild(typingContainer);
  playgroundContainer.appendChild(runContainer);

  data.js.model = monaco.editor.createModel('console.log("wasm-vips is awesome!")', 'javascript');
  data.css.model = monaco.editor.createModel('css', 'css');
  data.html.model = monaco.editor.createModel('html', 'html');

  editor = monaco.editor.create(editorContainer, {
    model: data.js.model,
    minimap: {
      enabled: false
    }
  });

  let currentToken = 0;

  function parseHash (firstTime) {
    let sampleId = window.location.hash.replace(/^#/, '');
    if (!sampleId) {
      sampleId = playSamples[0].id;
    }

    if (firstTime) {
      for (let i = 0; i < sampleSwitcher.options.length; i++) {
        const opt = sampleSwitcher.options[i];
        if (opt.value === sampleId) {
          sampleSwitcher.selectedIndex = i;
          break;
        }
      }
    }

    const myToken = (++currentToken);
    loadSample(sampleId, function (err, sample) {
      if (err) {
        alert('Sample not found! ' + err.message);
        return;
      }
      if (myToken !== currentToken) {
        return;
      }
      data.js.model.setValue(sample.js);
      data.html.model.setValue(sample.html);
      data.css.model.setValue(sample.css);
      editor.setScrollTop(0);
      run();
    });
  }

  window.onhashchange = parseHash;
  parseHash(true);

  function run () {
    doRun(runContainer);
  }

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, run);
  window.addEventListener('keydown', function keyDown (ev) {
    if ((isMac && !ev.metaKey) || !ev.ctrlKey) {
      return;
    }

    if (ev.shiftKey || ev.altKey || ev.keyCode !== 13) {
      return;
    }

    ev.preventDefault();
    run();
  });
}

function doRun (runContainer) {
  const getLang = function (lang) {
    return data[lang].model.getValue();
  };

  if (!runIframe) {
    // Load new iframe
    runIframe = document.createElement('iframe');
    runIframe.id = 'runner';
    runIframe.src = 'playground-runner.html';
    runIframe.className = 'run-iframe';
    runIframe.style.boxSizing = 'border-box';
    runIframe.style.height = '100%';
    runIframe.style.width = '100%';
    runIframe.style.border = '1px solid lightgrey';
    runIframe.frameborder = '0';
    runContainer.appendChild(runIframe);

    window.addEventListener('message', function (e) {
      if (e.source === runIframe.contentWindow) {
        vipsInitialized = true;
        runIframe.contentWindow.postMessage({
          js: getLang('js'),
          html: getLang('html'),
          css: getLang('css')
        }, '*');
      }
    });
  } else if (vipsInitialized) {
    runIframe.contentWindow.postMessage({
      js: getLang('js'),
      html: getLang('html'),
      css: getLang('css')
    }, '*');
  }
}

function xhr (url) {
  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(req);
      } else {
        reject(req);
      }
    };
    req.onerror = function () {
      reject(req);
    };
    req.responseType = '';
    req.send(null);
  });
}

window.onload = function () {
  xhr('../lib/vips.d.ts').then(function (response) {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(response.responseText, 'ts:vips.d.ts');
  });

  load();
};
