import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Input, Upload, Button, message, Slider, Row, Col, Tabs } from 'antd';
import {
    PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined,
    CaretRightFilled, PauseOutlined, RollbackOutlined, Loading3QuartersOutlined, FrownOutlined
} from '@ant-design/icons';
import { secondsToTime, checkValidLink } from 'utils';
import styles from './default.module.scss';

const { TabPane } = Tabs;
const { Search } = Input;

const Video = ({ videoUrl, ...props }) => {
    const divRef = useRef(null);
    const videoRef = useRef(null);
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

    useEffect(() => {
        if (videoRef.current) {
            const videoEle = videoRef.current;
            videoEle.onloadstart = () => message.success('start');
            videoEle.ondurationchange = () => setDuration(videoEle.duration);
            videoEle.onloadedmetadata = () => {
                const videoHeight = videoEle.videoHeight;
                const videoWidth = videoEle.videoWidth;
                let realHeight, realWidth;
                if (videoWidth / videoHeight < 4 / 3) {
                    realHeight = 525;
                    realWidth = (525 / videoHeight) * videoWidth;
                }
                else {
                    const divEle = divRef.current;
                    const divWidth = divEle.clientWidth;
                    realWidth = divWidth;
                    realHeight = (realWidth / videoWidth) * videoHeight;
                }
                setWidth(realWidth);
                setHeight(realHeight);
            };
            videoEle.onloadeddata = () => setPlayingStatus(videoEle.autoplay ? 0 : 1);
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
            videoEle.onerror = () => {
                setError({
                    status: 1,
                    text: 'Sorry, there was an error.'
                });
                setWidth("100%");
                setHeight(525);
            };
            videoEle.onstalled = () => {
                setError({
                    status: 1,
                    text: 'Sorry, the video is not available.'
                });
                setWidth("100%");
                setHeight(525);
            };
            videoEle.onabort = () => {
                setError({
                    status: 1,
                    text: 'Sorry, the video is stoped downloading.'
                });
                setWidth("100%");
                setHeight(525);
            };
        }
    }, [videoUrl]);
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
            {controlVisible && (
                <div className={styles.controlVisible}>
                    <Row className={styles.slider}>
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
                        />
                        <span className={styles.buffered} style={{ width: `${(bufferTime * 100) / duration}%` }}/>
                    </Row>
                    <Row className={styles.options}>
                        <Col span={12} className={styles.left}>
                            <span className={styles.playStatus} onClick={handleTogglePlay}>
                                {playingStatus === 1 ? (
                                    <CaretRightFilled />
                                ) : playingStatus === 0 ? (
                                    <PauseOutlined />
                                ) : (
                                    <RollbackOutlined />
                                )}
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
                            <div onClick={handleTogglePlay}><RollbackOutlined style={{ fontSize: '84px', cursor: 'pointer' }}/></div>
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
        </div>
    );
};

const DefaultPlayer = () => {
    const videoRef = useRef(null);
    const divRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editing, setEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
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
                        <Video videoUrl={videoUrl} loop/>
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