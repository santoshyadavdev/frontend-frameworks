import { CldImg, lazyload } from '../src'
import {CloudinaryImage} from "@cloudinary/base/assets/CloudinaryImage";
import CloudinaryConfig from "@cloudinary/base/config/CloudinaryConfig";
import {mount, shallow, ShallowWrapper} from 'enzyme';
import React, {Requireable} from "react";
import testWithMockedIntersectionObserver from "./setupIntersectionObserverMock";


const CONFIG_INSTANCE = new CloudinaryConfig({
  cloud: {
    cloudName: 'demo'
  }
});

let cl = new CloudinaryImage('sample').setConfig(CONFIG_INSTANCE);

describe('lazy-load', () => {
  it("should not have src pre-scroll", async function() {
    let component = await mount(
      <div>
        <div style={{height: "1000px"}}/>
        <CldImg transformation={cl} plugins={[lazyload()]}/>
      </div>
      );
    //no src pre scroll
    expect(component.html()).toBe("<div><div style=\"height: 1000px;\"></div><img></div>");
  });

  it("should have src when in view",  function(done) {
    const elm = document.createElement('img');
    testWithMockedIntersectionObserver((mockIntersectionEvent: ({}) => void)=>{
      let component = mount(<CldImg transformation={cl} plugins={[lazyload()]}/>);
      mockIntersectionEvent([{isIntersecting: true, target: component.getDOMNode()}]);
      setTimeout(()=>{
        expect(component.html()).toBe("<img src=\"https://res.cloudinary.com/demo/image/upload/sample\">");
        done();
      }, 0);// one tick
    });
  });

  it("should set lazyload root margin and threshold",  function(done) {
    const elm = document.createElement('img');
    testWithMockedIntersectionObserver((mockIntersectionEvent: ({}) => void)=>{
      //@ts-ignore
      let component = mount(<CldImg transformation={cl} plugins={[(lazyload('10px', 0.5))]}/>);
      mockIntersectionEvent([{isIntersecting: true, target: component.getDOMNode()}]);
      setTimeout(()=>{
        expect(component.html()).toBe("<img src=\"https://res.cloudinary.com/demo/image/upload/sample\">");
        done();
      }, 0);// one tick
    });
  });
});

