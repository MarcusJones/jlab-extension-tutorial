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

import {
  Message
} from '@phosphor/messaging';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
};


class APODWidget extends Widget {
  /**
   * New Widget
   */
  constructor() {
    super();
    this.addClass('my-apodWidget');

    // Add widget
    this.img = document.createElement('img');
    this.node.appendChild(this.img);

    // Add a summary element
    this.summary = document.createElement('p');
    this.node.appendChild(this.summary);
  }

  readonly img: HTMLImageElement;
  readonly summary: HTMLParagraphElement;

  async onUpdateRequest(msg: Message): Promise<void> {
    // Get information about picture
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${this.randomDate()}`);
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        this.summary.innerText = data.error.message;
      } else {
        this.summary.innerText = response.statusText;
        return;
      }
    }

    const data = await response.json() as APODResponse;

    if (data.media_type === 'image') {
      // Populate the image
      this.img.src = data.url;
      this.img.title = data.title;
      this.summary.innerText = data.title;
      if (data.copyright) {
        this.summary.innerText += ` (Copyright ${data.copyright})`
      }
    } else {
      console.log('Random APOD not a picture');
    }
  }

  // Random date
  randomDate() {
    const start = new Date(2010, 1, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().slice(0, 10);
  }

}

function activate(app: JupyterFrontEnd, palette: ICommandPalette) {

  console.log('JupyterLab extension jupyterlab_apod_mj is activated!');

  // Build the widget
  const content = new APODWidget();
  content.addClass('my-apodWidget');
  const widget = new MainAreaWidget({ content });
  widget.id = 'apod-jupyterlab-mj';
  widget.title.label = 'Astronomy pic';
  widget.title.closable = true;

  // Add image
  // let img = document.createElement('img');
  // content.node.appendChild(img);

  // let summary = document.createElement('p');
  // content.node.appendChild(summary);

  // Add an app command
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Random Astro Pic',
    execute: () => {
      if (!widget.isAttached) {
        // Attach it to main work area
        app.shell.add(widget, 'main');
      }
      content.update();
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  })

  // console.log('ICommandPalette:', palette);
  palette.addItem({ command, category: 'Tutorial' });
}

/**
 * Initialization data for the jupyterlab_apod_mj extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_apod_mj',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activate
}

export default extension;
