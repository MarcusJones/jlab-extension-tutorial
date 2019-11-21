import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the jupyterlab_apod_mj extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_apod_mj',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_apod_mj is activated!');
  }
};

export default extension;
