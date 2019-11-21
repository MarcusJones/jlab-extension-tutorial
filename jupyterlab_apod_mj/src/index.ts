import {
  ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette, MainAreaWidget, WidgetTracker
} from '@jupyterlab/apputils';

import {
  Message
} from '@phosphor/messaging';

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

    console.log('Built APODWidget class, inheriting from Widget class');
  }

  readonly img: HTMLImageElement;
  readonly summary: HTMLParagraphElement;

  async onUpdateRequest(msg: Message): Promise<void> {
    console.log('Call: WPODWidget.onUpdateRequest');

    // Get information about picture
    console.log('\tfetching image...');

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

    console.log('\tresponse ok, getting data');
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

function activate(app: JupyterFrontEnd, palette: ICommandPalette, restorer: ILayoutRestorer) {
  console.log('Calling activate()');

  console.log('JupyterLab extension jupyterlab_apod_mj is activated!');

  // Declare the widget
  let widget: MainAreaWidget<APODWidget>;

  // Add an application command
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Random Astro Pic',
    execute: () => {
      if (!widget) {
        // Create widget if none exists
        const content = new APODWidget();

        widget = new MainAreaWidget({ content });
        widget.id = 'apod-jupyterlab-mj';
        widget.title.label = 'Astronomy pic';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach it to main work area
        app.shell.add(widget, 'main');
      }
      widget.content.update();

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette
  palette.addItem({ command, category: 'Tutorial' });


  let tracker = new WidgetTracker<MainAreaWidget<APODWidget>>({
    namespace: 'apod'
  });

  restorer.restore(tracker, {
    command,
    name: () => 'apod'
  });
}

/**
 * Initialization data for the jupyterlab_apod_mj extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_apod_mj',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
}

export default extension;
