import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CloudinaryVideoComponent } from '../lib/cloudinary-video.component';
import {CloudinaryVideo} from '@cloudinary/base';
import { auto, vp9 } from '@cloudinary/base/qualifiers/videoCodec';
import { videoCodec } from '@cloudinary/base/actions/transcode';

const cloudinaryVideo = new CloudinaryVideo('sample', { cloudName: 'demo'});

describe('CloudinaryVideoComponent render', () => {
  let component: CloudinaryVideoComponent;
  let fixture: ComponentFixture<CloudinaryVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudinaryVideoComponent ],
    });
    fixture = TestBed.createComponent(CloudinaryVideoComponent);
    component = fixture.componentInstance;
  });

  it('should render video with default sources', fakeAsync(() => {
    component.cldVid = cloudinaryVideo;
    fixture.detectChanges();
    tick(0);
    const vidElement: HTMLVideoElement = fixture.nativeElement;
    const video = vidElement.querySelector('video');
    const defaultVideoTypes = ['webm', 'mp4', 'ogg'];

    expect(video.childElementCount).toBe(3);

    for (let i = 0; i < 3; i++) {
      expect(video.children[i].attributes.getNamedItem('src')).toBeDefined();
      expect(video.children[i].attributes.getNamedItem('src').value)
        .toEqual( `https://res.cloudinary.com/demo/video/upload/sample.${defaultVideoTypes[i]}`);
    }
  }));

  it('changes should trigger plugin rerun', fakeAsync(() => {
    component.cldVid = cloudinaryVideo;
    const mockPlugin = jasmine.createSpy('spy');
    component.plugins = [mockPlugin];
    fixture.detectChanges();
    tick(0);

    // plugins called once
    expect(mockPlugin).toHaveBeenCalledTimes(1);

    // trigger ngOnChanges
    component.cldVid = new CloudinaryVideo('dog', { cloudName: 'demo'});
    fixture.detectChanges();
    component.ngOnChanges();

    // plugins should be called twice after onChange
    expect(mockPlugin).toHaveBeenCalledTimes(2);
  }));

  it('should render video with input sources', fakeAsync(() => {
    component.cldVid = cloudinaryVideo;
    component.sources = [
      {
        type: 'mp4',
        codecs: ['vp8', 'vorbis'],
        transcode: videoCodec(auto())
      },
      {
        type: 'webm',
        codecs: ['avc1.4D401E', 'mp4a.40.2'],
        transcode: videoCodec(vp9())
      }];

    fixture.detectChanges();
    tick(0);
    const vidElement: HTMLVideoElement = fixture.nativeElement;
    const video = vidElement.querySelector('video');
    const defaultVideoTypes = ['webm', 'mp4', 'ogg'];

    expect(video.childElementCount).toBe(2);

    // First source
    expect(video.children[0].attributes.getNamedItem('src').value)
        .toEqual( 'https://res.cloudinary.com/demo/video/upload/vc_auto/sample.mp4');
    expect(video.children[0].attributes.getNamedItem('type').value)
      .toEqual( 'video/mp4; codecs=vp8, vorbis');

    // Second source
    expect(video.children[1].attributes.getNamedItem('src').value)
      .toEqual( 'https://res.cloudinary.com/demo/video/upload/vc_vp9/sample.webm');
    expect(video.children[1].attributes.getNamedItem('type').value)
      .toEqual( 'video/webm; codecs=avc1.4D401E, mp4a.40.2');
  }));

  it('should emit playing event', fakeAsync(() => {
    component.cldVid = cloudinaryVideo;
    fixture.detectChanges();
    tick(0);
    spyOn(component, 'emitPlayingEvent');
    const videoElement: HTMLVideoElement = fixture.nativeElement;
    const vid = videoElement.querySelector('video');

    vid.dispatchEvent(new Event('playing'));
    fixture.detectChanges();

    expect(component.emitPlayingEvent).toHaveBeenCalled();
  }));

  it('should emit play event', fakeAsync(() => {
    component.cldVid = cloudinaryVideo;
    fixture.detectChanges();
    tick(0);
    spyOn(component, 'emitPlayEvent');
    const videoElement: HTMLVideoElement = fixture.nativeElement;
    const vid = videoElement.querySelector('video');

    vid.dispatchEvent(new Event('play'));
    fixture.detectChanges();

    expect(component.emitPlayEvent).toHaveBeenCalled();
  }));
});

