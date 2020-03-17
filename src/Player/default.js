import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { Input, Upload, Button, message, Slider, Row, Col } from 'antd';
import {
    PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined,
    CaretRightFilled, PauseOutlined, RollbackOutlined
} from '@ant-design/icons';
import { secondsToTime } from 'utils';
import styles from './default.module.scss';

const Video = ({ videoUrl, ...props }) => {
    const divRef = useRef(null);
    const videoRef = useRef(null);
    const [controlVisible, setControlVisible] = useState(false);
    const [duration, setDuration] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [bufferTime, setBufferTime] = useState(0);
    const [playingStatus, setPlayingStatus] = useState(0);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            const videoEle = videoRef.current;
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
            videoEle.ontimeupdate = () => setCurrentTime(videoEle.currentTime);
            videoEle.onwaiting = () => setWaiting(true);
            videoEle.onplaying = () => setWaiting(false);
            videoEle.onplay = () => setPlayingStatus(0);
            videoEle.onpause = () => setPlayingStatus(1);
            videoEle.onended = () => setPlayingStatus(2);
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
            else videoEle.play();
            setPlayingStatus(playingStatus === 0 ? 1 : 0);
        }
    };
    const handleChangeCurrentTime = value => {
        const videoEle = videoRef.current;
        if (videoEle) {
            videoEle.currentTime = value;
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
                    <Row className={styles.slider}>
                        <Slider
                            min={0}
                            max={_.round(duration, 1)}
                            step={0.1}
                            value={currentTime}
                            onChange={value => setCurrentTime(value)}
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
                                {`${secondsToTime(currentTime)} / ${secondsToTime(duration)}`}
                            </span>
                        </Col>
                        <Col span={12} className={styles.right}>

                        </Col>
                    </Row>
                </div>
            )}
            {playingStatus === 2 && (
                <div className={styles.replay}>
                    <div className={styles.outer}>
                        <div className={styles.inlineDiv}>
                            <div onClick={handleTogglePlay}><RollbackOutlined style={{ fontSize: '84px', cursor: 'pointer' }}/></div>
                            <div className={styles.text}>Play again</div>
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
    const [videoUrl, setVideoUrl] = useState('https://a2.udemycdn.com/2018-02-27_02-58-55-73dd87dd3dc3d0a9f4443ecd90ed6c38/WebHD_480.mp4?nva=20200317142029&token=06cffa9e01680d9eb700f');
    const [processing, setProcessing] = useState(false);
    const handleCloseChange = () => {
        setEditing(false);
        handleRemoveFile();
    };
    const handleChange = () => {
        setEditing(true);
    };
    const handleDelete = () => {

    };
    const handleBeforeUpload = (file) => {
        const fileSize = file.size;
        const fileType = file.type;
        if (fileSize > 104857600) message.error('Your video is too big.');
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
                    <div className={styles.uploader}>
                        <div className={styles.warning}>
                            HuYeFen player only suport .mp4 video file. The video must less than 100MB.
                        </div>
                        <div className={styles.upload}>
                            <Input
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
                    </div>
                )}
            </div>
        </div>
    )
};

export default DefaultPlayer;