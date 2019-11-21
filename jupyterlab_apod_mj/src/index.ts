import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget
} from '@jupyterlab/apputils';

import {
  Widget,
  // PanelLayout
} from '@phosphor/widgets';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
};


/**
 * Initialization data for the jupyterlab_apod_mj extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_apod_mj',
  autoStart: true,
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension jupyterlab_apod_mj is activated!');

    // Build the MainAreaWidget
    const content = new Widget();
    content.addClass('my-apodWidget');
    const widget = new MainAreaWidget({content});
    widget.id = 'apod-jupyterlab-mj';
    widget.title.label = 'Astronomy pic';
    widget.title.closable = true;

    // Add image
    let img = document.createElement('img');
    content.node.appendChild(img);

    let summary = document.createElement('p');
    content.node.appendChild(summary);

    // Random date
    function randomDate(){
      const start = new Date(2010, 1, 1);
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 10);
    }

    // Get information about picture
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${randomDate()}`);
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        summary.innerText = data.error.message;
      } else {
        summary.innerText = response.statusText;
      }
    } else {
      const data = await response.json() as APODResponse;

      if (data.media_type === 'image') {
        // Populate the image
        img.src = data.url;
        img.title = data.title;
        summary.innerText = data.title;
        if (data.copyright) {
          summary.innerText += ` (Copyright ${data.copyright})`
        }
      } else {
        console.log('Random APOD not a picture');
      }

    // Add an app command
    const command: string = 'apod:open';
    app.commands.addCommand(command, {
      label: 'Random Astro Pic',
      execute: () => {
        if (!widget.isAttached) {
          // Attach it to main work area
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    })

    console.log('ICommandPalette:', palette);
    palette.addItem({command, category: 'Tutorial'});
  }
};

export default extension;
