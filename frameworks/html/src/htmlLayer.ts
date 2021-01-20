import {CloudinaryImage} from "@cloudinary/base/assets/CloudinaryImage";
import {plugins, htmlPluginState} from './types'
import cloneDeep from 'lodash/cloneDeep'

export class HtmlLayer{
  private img: any;
  htmlPluginState: htmlPluginState;
  constructor(element: HTMLImageElement | null, userCloudinaryImage: CloudinaryImage, plugins?: plugins){
    this.img = element;
    this.htmlPluginState = {cleanupCallbacks:[], pluginEventSubscription: []};
    const pluginCloudinaryImage  = cloneDeep(userCloudinaryImage);
    this.render(element, pluginCloudinaryImage, plugins)
        .then(()=>{ // when resolved updates the src
          this.htmlPluginState.pluginEventSubscription.forEach(fn=>{fn()});
          this.img.setAttribute('src', pluginCloudinaryImage.toURL());
        });
  }
  /**
   * Iterate through plugins and break in cases where the response is canceled. The
   * response is canceled if component is updated or unmounted
   * @param element Image element
   * @param pluginCloudinaryImage
   * @param plugins array of plugins passed in by the user
   * @return {Promise<void>}
   */
  async render(element: HTMLImageElement, pluginCloudinaryImage: CloudinaryImage, plugins: any) {
    if(plugins === undefined) return;
    for(let i = 0; i < plugins.length; i++){
      const response = await plugins[i](element, pluginCloudinaryImage, this.htmlPluginState);
      if(response === 'canceled'){
        break;
      }
    }
  }

  /**
   * Called when component is updated and re-triggers render
   * @param userCloudinaryImage
   * @param plugins
   */
  update(userCloudinaryImage: CloudinaryImage, plugins: any){
    const pluginCloudinaryImage  = cloneDeep(userCloudinaryImage);
    this.render(this.img, pluginCloudinaryImage, plugins)
        .then(()=>{
          this.img.setAttribute('src', pluginCloudinaryImage.toURL());
        });
  }

  /**
   * Cancels currently running plugins. This is called from unmount or update
   */
  cancelCurrentlyRunningPlugins(): void{
    this.htmlPluginState.cleanupCallbacks.forEach((fn: any) => {
      fn();// resolve each promise with 'canceled'
    })
  }
}