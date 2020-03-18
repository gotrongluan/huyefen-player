import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Input, Upload, Button, message, Slider, Row, Col, Tabs } from 'antd';
import {
    PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined,
    CaretRightFilled, PauseOutlined, ReloadOutlined, Loading3QuartersOutlined, FrownOutlined, BackwardOutlined, ForwardOutlined
} from '@ant-design/icons';
import Mute from 'icons/Mute';
import SmallVolume from 'icons/SmallVolume';
import Volume from 'icons/Volume';
import { secondsToTime, checkValidLink } from 'utils';
import styles from './default.module.scss';

const { TabPane } = Tabs;
const { Search } = Input;

const Video = ({ videoUrl, ...props }) => {
    const divRef = useRef(null);
    const videoRef = useRef(null);
    const previewRef = useRef(null);
    const [controlVisible, setControlVisible] = useState(false);
    const [duration, setDuration] = useState(null);
    const [currentTime, setCurrentTime] = useState({
        changing: false,
        value: 0
    });
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [bufferTime, setBufferTime] = useState(0);
    const [playingStatus, setPlayingStatus] = useState(0);
    const [waiting, setWaiting] = useState(false);
    const [error, setError] = useState({
        status: 0,
        text: ''
    });
    const [preview, setPreview] = useState({
        visible: false,
        time: 0,
        left: 0,
        bottom: 0
    });
    const [previewWidth, setPreviewWidth] = useState(0);
    const [previewHeight, setPreviewHeight] = useState(0);
    const [volume, setVolume] = useState(0);
    const [oldVolume, setOldVolume] = useState(0);
    const [volumeVisible, setVolumeVisible] = useState(false);
    useEffect(() => {
        if (videoRef.current) {
            const videoEle = videoRef.current;
            videoEle.ondurationchange = () => setDuration(videoEle.duration);
            videoEle.onloadedmetadata = () => {
                const videoHeight = videoEle.videoHeight;
                const videoWidth = videoEle.videoWidth;
                let realHeight, realWidth, realPreviewHeight, realPreviewWidth;
                if (videoWidth / videoHeight < 4 / 3) {
                    realHeight = 525;
                    realWidth = (525 / videoHeight) * videoWidth;
                    realPreviewHeight = 84;
                    realPreviewWidth = (84 / videoHeight) * videoWidth;
                }
                else {
                    const divEle = divRef.current;
                    const divWidth = divEle.clientWidth;
                    realWidth = divWidth;
                    realHeight = (realWidth / videoWidth) * videoHeight;
                    realPreviewWidth = 160;
                    realPreviewHeight = (realPreviewWidth / videoWidth) * videoHeight;
                }
                setPreviewWidth(realPreviewWidth);
                setPreviewHeight(realPreviewHeight);
                setWidth(realWidth);
                setHeight(realHeight);
            };
            videoEle.onloadeddata = () => {
                setPlayingStatus(videoEle.autoplay ? 0 : 1);
                setVolume(videoEle.volume);
                if (videoEle.volume === 0) setOldVolume(1); else setOldVolume(videoEle.volume);
            };
            videoEle.onprogress = () => {
                let buffer = 0;
                for (let i = 0; i < videoEle.buffered.length; i++) {
                    if (videoEle.buffered.start(videoEle.buffered.length - 1 - i) <= videoEle.currentTime) {
                        buffer = videoEle.buffered.end(videoEle.buffered.length - 1 - i);
                        setBufferTime(buffer);
                        return;
                    }
                } 
            };
            videoEle.oncanplay = () => {
                setError({
                    status: 0,
                    text: ''
                });
            };
            videoEle.ontimeupdate = () => {
                setCurrentTime(prevState => {
                    if (prevState.changing) return { ...prevState };
                    return {
                        changing: false,
                        value: videoEle.currentTime
                    };
                })
            }
            videoEle.onwaiting = () => setWaiting(true);
            videoEle.onplaying = () => setWaiting(false);
            videoEle.onplay = () => setPlayingStatus(0);
            videoEle.onpause = () => setPlayingStatus(1);
            videoEle.onended = () => setPlayingStatus(2);
            videoEle.onerror = () => handleError('Sorry, there was an error');
            videoEle.onstalled = () => handleError('Sorry, the video is not available.');
            videoEle.onabort = () => handleError('Sorry, the video is stoped downloading.');
        }
    }, [videoUrl]);
    const handleError = messageText => {
        setError({
            status: 1,
            text: messageText
        });
        setWidth(prevWidth => prevWidth === 0 ? '100%' : prevWidth);
        setHeight(prevHeight => prevHeight === 0 ? 525 : prevHeight);
    };
    const handleMouseEnter = () => {
        setControlVisible(true);
    };
    const handleMouseLeave = () => {
        setControlVisible(false);
    };
    const handleTogglePlay = () => {
        const videoEle = videoRef.current;
        if (videoEle) {
            if (playingStatus === 0) videoEle.pause();
            else if (playingStatus === 2) {
                videoEle.currentTime = 0;
                videoEle.play();
            }
            else videoEle.play();
            setPlayingStatus(playingStatus === 0 ? 1 : 0);
        }
    };
    const handleChangeCurrentTime = value => {
        const videoEle = videoRef.current;
        if (videoEle) {
            videoEle.currentTime = value;
            setCurrentTime({
                changing: false,
                value
            });
        }
    };
    const handleMouseOnSlider = e => {
        const offsetX = e.nativeEvent.offsetX;
        const sliderWidth = divRef.current.clientWidth - 24;
        const time = (offsetX / sliderWidth) * duration;
        const clientX = e.clientX;
        const clientY = e.clientY;
        const left = clientX - 82;
        const bottom = window.innerHeight - clientY + 16;
        previewRef.current.currentTime = time;
        setPreview({
            visible: true,
            time,
            left,
            bottom
        });
    };
    const resetPreview = () => {
        setPreview({
            visible: false,
            time: 0,
            left: 0,
            bottom: 0
        });
    };
    const handlePlayBack = () => {
        const videoEle = videoRef.current;
        if (videoEle) {
            videoEle.currentTime = videoEle.currentTime - 15;
            if (videoEle.pause) videoEle.play();
        }
    };
    const handlePlayForward = () => {
        const videoEle = videoRef.current;
        if (videoEle) {
            videoEle.currentTime = videoEle.currentTime + 15;
            if (videoEle.pause) videoEle.play();
        }
    };
    const handleSetVolume = value => {
        const videoEle = videoRef.current;
        if (videoEle) {
            videoEle.volume = value;
            if (value > 0) setOldVolume(value);
        }
    };
    const handleToggleVolume = () => {
        const videoEle = videoRef.current;
        if (videoEle) {
            if (volume > 0) {
                setVolume(0);
                videoEle.volume = 0;
            }
            else {
                setVolume(oldVolume);
                videoEle.volume = oldVolume;
            }
        }
    };
    return (
        <div className={styles.video} ref={divRef} style={{ height: height }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <video
                {...props}
                ref={videoRef}
                className={styles.videoEle}
                width={width}
                height={height}
                onClick={handleTogglePlay}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video element.
            </video>
            {true && (
                <div className={styles.controlVisible}>
                    <div className={styles.slider} onMouseMove={handleMouseOnSlider} onMouseLeave={resetPreview}>
                        <Slider
                            min={0}
                            max={_.round(duration, 1)}
                            step={0.1}
                            value={currentTime.value}
                            onChange={value => {
                                setCurrentTime({
                                    value,
                                    changing: true
                                });
                            }}
                            onAfterChange={handleChangeCurrentTime}
                            tooltipVisible={false}
                        />
                        <span className={styles.buffered} style={{ width: `${(bufferTime * 100) / duration}%` }}/>
                    </div>
                    <Row className={styles.options}>
                        <Col span={12} className={styles.left}>
                            <span className={styles.back} onClick={handlePlayBack}>
                                <BackwardOutlined />
                            </span>
                            <span className={styles.playStatus} onClick={handleTogglePlay}>
                                {playingStatus === 1 ? (
                                    <CaretRightFilled />
                                ) : playingStatus === 0 ? (
                                    <PauseOutlined />
                                ) : (
                                    <ReloadOutlined />
                                )}
                            </span>
                            <span className={styles.forward} onClick={handlePlayForward}>
                                <ForwardOutlined />
                            </span>
                            <span className={styles.volume} onMouseEnter={() => setVolumeVisible(true)} onMouseLeave={() => setVolumeVisible(false)}>
                                <Button className={styles.sound} onClick={handleToggleVolume}>
                                    {volume === 0 ? (
                                        <>
                                            <Mute/>
                                            <CloseOutlined className={styles.close} />
                                        </>
                                    ) : volume < 0.5 ? (
                                        <SmallVolume/>
                                    ) : (
                                        <Volume/>
                                    )}
                                </Button>
                                <span className={volumeVisible ? styles.slider : classNames(styles.slider, styles.hiddenSlider)} >
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={volume}
                                        onChange={value => setVolume(value)}
                                        onAfterChange={handleSetVolume}
                                    />
                                </span>
                            </span>
                            <span className={styles.time}>
                                {`${secondsToTime(currentTime.value)} / ${secondsToTime(duration)}`}
                            </span>
                        </Col>
                        <Col span={12} className={styles.right}>

                        </Col>
                    </Row>
                </div>
            )}
            {playingStatus === 2 && (
                <div className={classNames(styles.overlay, styles.replay)}>
                    <div className={styles.outer}>
                        <div className={styles.inlineDiv}>
                            <div onClick={handleTogglePlay}><ReloadOutlined style={{ fontSize: '84px', cursor: 'pointer' }}/></div>
                            <div className={styles.text}>Play again</div>
                        </div>
                    </div>
                </div>
            )}
            {waiting && (
                <div className={styles.overlay}>
                    <div className={styles.outer}>
                        <div className={styles.inlineDiv}>
                            <Loading3QuartersOutlined style={{ fontSize: '84px', cursor: 'pointer' }} spin/>
                        </div>
                    </div>
                </div>
            )}
            {error.status === 1 && (
                <div className={classNames(styles.overlay, styles.error)}>
                    <div className={styles.outer}>
                        <div className={styles.inlineDiv}>
                            <FrownOutlined />
                            <span className={styles.text}>{error.text}</span>
                        </div>
                    </div>
                </div>
            )}
            <div
                className={styles.preview}
                style={{
                    left: preview.left,
                    bottom: preview.bottom,
                    visibility: preview.visible ? 'visible' : 'hidden',
                    height: previewHeight
                }}
            >
                <div className={styles.inner}>
                    <video muted ref={previewRef} className={styles.videoElement} width={previewWidth} height={previewHeight}>
                        <source src={videoUrl} type="video/mp4" />
                    </video>
                    <span className={styles.time}>{`${secondsToTime(preview.time)}`}</span>
                </div>
            </div>
        </div>
    );
};

const DefaultPlayer = () => {
    const videoRef = useRef(null);
    const divRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editing, setEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('https://a2.udemycdn.com/2018-05-11_11-14-45-8469d1761758f153fa31634801ff8d12/WebHD_480.mp4?nva=20200318110018&token=05a26174b39ce1fa9e411');
    const [processing, setProcessing] = useState(false);
    const [externalUrl, setExternalUrl] = useState('');
    const handleCloseChange = () => {
        setEditing(false);
        handleChangeTab();
    };
    const handleChange = () => {
        setEditing(true);
    };
    const handleChangeTab = () => {
        handleRemoveFile();
        setExternalUrl('');
    };
    const handleDelete = () => {

    };
    const handleAddExternal = () => {
        setVideoUrl(null);
        
        handleCloseChange();
        setTimeout(() => setVideoUrl(externalUrl), 1000);
    };
    const handleBeforeUpload = (file) => {
        const fileSize = file.size;
        const fileType = file.type;
        if (fileSize > 6604857600) message.error('Your video is too big.');
        else if (fileType !== 'video/mp4') message.error('Only support .mp4 video! Please replace with .mp4 video.');
        else {
            setFile(file);
            setFileName(file.name);
        }
        return false;
    };
    const handleRemoveFile = () => {
        setFile(null);
        setFileName('');
    };
    const handleUpload = () => {
        setProcessing(true);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            const result = fileReader.result;
            setVideoUrl(null);
            setVideoUrl(result);
            handleCloseChange();
            setProcessing(false);
        };
    };
    const uploadProps = {
        accept: 'video/mp4',
        name: 'videoFile',
        beforeUpload: handleBeforeUpload,
        openFileDialogOnClick: !file,
        showUploadList: false
    };
    return (
        <div className={styles.defaultPlayer}>
            <div className={styles.title}>Default Player</div>
            <div className={styles.main}>
                {videoUrl && (
                    <div className={styles.videoAndBtns}>
                        <Video videoUrl={videoUrl}/>
                        <div className={styles.btns}>
                            {editing ? (
                                <Button onClick={handleCloseChange}>
                                    <CloseOutlined /> Close
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleChange}>
                                        <EditOutlined /> Replace
                                    </Button>
                                    <Button onClick={handleDelete} style={{ marginLeft: '12px' }}>
                                        <DeleteOutlined /> Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {(!videoUrl || editing) && (
                    <div className={styles.tabs}>
                        <Tabs defaultActiveKey="upload" onChange={handleChangeTab}>
                            <TabPane tab="Desktop" key="upload">
                                <div className={styles.upload}>
                                    <div className={styles.warning}>
                                        HuYeFen player only suport .mp4 video file. The video must less than 100MB.
                                    </div>
                                    <Input
                                        className={styles.uploadInput}
                                        disabled={processing}
                                        value={fileName}
                                        placeholder="No file selected."
                                        addonBefore={(
                                            <span className={styles.addOnBefore}>
                                                <PlayCircleFilled style={{ color: '#090199', position: 'relative', top: '1px' }} />
                                                <span className={styles.text}>Video file:</span>
                                            </span>
                                        )}
                                        size="large"
                                        addonAfter={(
                                            <span className={styles.addOnAfter}>
                                                {!file ? (
                                                    <Upload {...uploadProps}>
                                                        <span className={styles.btn}>
                                                            <UploadOutlined />
                                                        </span>
                                                    </Upload>
                                                ) : processing ? (
                                                    <LoadingOutlined spin />
                                                ) : (
                                                    <span>
                                                        <span className={styles.btn} onClick={handleUpload}>
                                                            <CloudUploadOutlined />
                                                        </span>
                                                        <span className={styles.btn} onClick={handleRemoveFile} style={{ marginLeft: '6px' }}>
                                                            <DeleteOutlined />
                                                        </span>
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    />
                                </div>
                            </TabPane>
                            <TabPane tab="External" key="external">
                                <div className={styles.external}>
                                    <div className={styles.warning}>
                                        Add link to .mp4 video file to below input and press button to submit.
                                    </div>
                                    <Search
                                        placeholder="External link"
                                        value={externalUrl}
                                        onChange={e => setExternalUrl(e.target.value)}
                                        enterButton={
                                            <Button disabled={!checkValidLink(externalUrl)} type="primary">
                                                Submit
                                            </Button>
                                        }
                                        onSearch={handleAddExternal}
                                        size="large"
                                    />
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    )
};

export default DefaultPlayer;