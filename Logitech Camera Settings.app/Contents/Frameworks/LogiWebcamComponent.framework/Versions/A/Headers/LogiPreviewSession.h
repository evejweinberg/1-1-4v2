//
//  LogiPreviewSession.h
//  LogiWebcamComponent
//
//  Created by Tejus Adiga on 05/10/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <LogiWebcamComponent/LogiAVDevice.h>
#import <LogiWebcamComponent/DecoderProtocol.h>

@protocol LogiPreviewSessionDelegate <NSObject>

-(void)didFindError:(NSError*)error;

-(void)mouseDidEnterView;

-(void)mouseDidLeaveView;

- (void)audioGainChanged: (float)gainValue;

@end

@class LogiAudioDevice;
@class LogiVideoDevice;
@class LogiPreviewView;
@class ICMDecoder;

@interface LogiPreviewSession : NSObject <LogiAVDeviceDelegate, DecoderProtocol>
{
    LogiVideoDevice*    mDevice;
    LogiAudioDevice*    mAudioDevice;
    LogiPreviewView*    mPreviewView;
    
    ICMDecoder*         mDecoder;
    
    BOOL                mIsRunning;
    
    id<LogiPreviewSessionDelegate> mDelegate;
}

@property (nonatomic, assign) id<LogiPreviewSessionDelegate>   delegate;
@property (assign) LogiVideoDevice*                 device;
@property (nonatomic, retain) LogiAudioDevice*      audioDevice;
@property (assign) LogiPreviewView*                 previewView;
@property (readonly, nonatomic) BOOL                isRunning;

-(id)initWithDevice:(LogiAVDevice*)inDevice
        andDelegate:(id<LogiPreviewSessionDelegate>)inDelegate;

-(OSStatus)openSession;

-(OSStatus)startSessionWithPreview:(NSView*)inopenGLView;

-(OSStatus)capturePhotoFrameToPath:(NSString*)inPhotopath;

-(OSStatus)pauseSession;

-(OSStatus)resumeSession;

-(OSStatus)stopSession;

-(void)closeSession;

@end