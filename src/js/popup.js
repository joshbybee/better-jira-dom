class Popup {
  constructor() {
    this.Storage = chrome.storage.sync;
    this.data = {};
    this.defaults = {
      columnWidth: 200,
      enabled: true,
      standup: false,
      updatedEvent: 'better-jira:updated',
    };

    this.loadListener = this.boot.bind(this);
    window.addEventListener('load', this.loadListener);
  }

  boot() {
    window.removeEventListener('load', this.loadListener);

    this.setDefaults();
    this.handleFormEvents();
  }

  setDefaults() {
    this.Storage.get('columnWidth', (storage) => {
      console.log('storage', storage);
      let value = storage.columnWidth;
      console.log('columnWidth from Storage', value);
      if(!value) {
        value = this.defaults.columnWidth;
        this.Storage.set({columnWidth: value});
      }
      this.data.columnWidth = value;

      document.getElementById('columnWidth').value = this.data.columnWidth;
    });

    this.Storage.get('enabled', (storage) => {
      let value = storage.enabled;
      if(value === undefined) {
        value = this.defaults.enabled;
        this.Storage.set({enabled: value});
      }

      this.data.enabled = value;
      console.log('enabled storage', storage);

      document.getElementById('enabled').checked = !! value;
    });    

    this.Storage.get('standup', (storage) => {
      let value = storage.standup;
      if(value === undefined) {
        value = this.defaults.standup;
        this.Storage.set({standup: value});
      }

      this.data.standup = value;
      console.log('standup storage', storage);

      document.getElementById('standup').checked = !! value;
    });

    this.Storage.get('ready2migrate', (storage) => {
      let value = storage.ready2migrate;
      if(value === undefined) {
        value = this.defaults.ready2migrate;
        this.Storage.set({ready2migrate: value});
      }

      this.data.ready2migrate = value;
      console.log('ready2migrate storage', storage);

      document.getElementById('ready2migrate').checked = !! value;
    });

    this.Storage.get('verifyInProd', (storage) => {
      let value = storage.verifyInProd;
      if(value === undefined) {
        value = this.defaults.verifyInProd;
        this.Storage.set({verifyInProd: value});
      }

      this.data.verifyInProd = value;
      console.log('verifyInProd storage', storage);

      document.getElementById('verifyInProd').checked = !! value;
    });

    this.Storage.get('done', (storage) => {
      let value = storage.done;
      if(value === undefined) {
        value = this.defaults.done;
        this.Storage.set({done: value});
      }

      this.data.done = value;
      console.log('done storage', storage);

      document.getElementById('done').checked = !! value;
    });
  }

  handleFormEvents() {
    //-- Close the window
    let close = document.getElementById('close');
    close.addEventListener('click', (event) => {
      window.close();
    });

    //-- Trigger Enabled (as a 1-click event)
    let enabled = document.getElementById('enabled');
    enabled.addEventListener('click', (event) => {
      this.data.enabled = enabled.checked;
      this.save();
    });

    //-- Trigger Standup (as a 1-click event)
    let standup = document.getElementById('standup');
    standup.addEventListener('click', (event) => {
      console.log('you clicked it!', standup.checked, event);
      this.data.standup = standup.checked;
      this.save();
    });

    //-- Toggle Column (as a 1-click event)
    let ready2migrate = document.getElementById('ready2migrate');
    ready2migrate.addEventListener('click', (event) => {
      console.log('you clicked ready2migrate!', ready2migrate.checked, event);
      this.data.ready2migrate = ready2migrate.checked;
      this.save();
    });

    //-- Toggle Column (as a 1-click event)
    let verifyInProd = document.getElementById('verifyInProd');
    verifyInProd.addEventListener('click', (event) => {
      console.log('you clicked verifyInProd!', verifyInProd.checked, event);
      this.data.verifyInProd = verifyInProd.checked;
      this.save();
    });

    //-- Toggle Column (as a 1-click event)
    let done = document.getElementById('done');
    done.addEventListener('click', (event) => {
      console.log('you clicked done!', done.checked, event);
      this.data.done = done.checked;
      this.save();
    });

    document.getElementById('better-jira').addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('form submission information', arguments);
      this.data.columnWidth = document.getElementById('columnWidth').value;
      this.data.enabled = document.getElementById('enabled').checked;
      this.save();
    });
  }

  save() {
    this.Storage.set({enabled: this.data.enabled}, () => {
      this.Storage.set({enabled: this.data.ready2migrate}, () => {
        this.Storage.set({enabled: this.data.verifyInProd}, () => {
          this.Storage.set({enabled: this.data.done}, () => {
            this.Storage.set({columnWidth: this.data.columnWidth}, () => {
              this.Storage.set({standup: this.data.standup}, this.refresh.bind(this));
            });
          });
        });
      });
    });
  }

  refresh() {
    let code = [
      `(function()`,
      `{`,
        `'use strict';`,

        `let updateEvent = new CustomEvent('${this.defaults.updatedEvent}', {`,
          `detail: {`,
            `columnWidth: ${this.data.columnWidth},`,
            `enabled: ${this.data.enabled},`,
            `enabled: ${this.data.ready2migrate},`,
            `enabled: ${this.data.verifyInProd},`,
            `enabled: ${this.data.done},`,
            `standup: ${this.data.standup},`,
          `}`,
        `});`,
        `document.dispatchEvent(updateEvent);`,
      `})();`,
    ];

    chrome.tabs.executeScript({
      code: code.join('')
    });
  }
}

new Popup;
