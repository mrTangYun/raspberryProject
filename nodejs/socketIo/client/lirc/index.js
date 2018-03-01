/**
 * Created by tangyun on 2018/2/3.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { List, Switch, Icon } from 'antd-mobile';

import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'
import './css.css';
import io from 'socket.io-client';

function calAngle(start,end){
	const diff_x = end.x - start.x,
		diff_y = end.y - start.y;
	// Math.atan2(dy,dx);

	const origin = {x: start.x, y:start.y}; // 先手动指定当前中心点，也可以根据当前元素的left+width/2 的到x  top+height/2 得到y值
	// 计算出当前鼠标相对于元素中心点的坐标
	const x = end.x - origin.x; // 因为x大于origin.x 是在y轴右边，直接减就行了
	const y = end.y - origin.y;// 但是y如果要在x轴上方，它是比origin.y要小的，所以这里就需要反过来

	// 然后计算就可以了
	//返回角度，不是弧度
	return -Math.atan2(y,x) / (Math.PI/180);
}
export default class LircContainer extends Component {
	constructor() {
		super();
		this.clickArrowAreaHandler = this.clickArrowAreaHandler.bind(this);
		this.clickKeyHandler = this.clickKeyHandler.bind(this);
		this.toggleDeviceOrientationHandler = this.toggleDeviceOrientationHandler.bind(this);
		this.deviceOrientationHandler = this.deviceOrientationHandler.bind(this);
		this.state = {
			isPhotoing: false,
            camaraActionTxt: '',
            isSupportDeviceOrientationEvent: !!window.DeviceOrientationEvent,
			isStartingHanderDeviceOrientationEvent: false,
			gamaValue: ''
		};
		this.gama = null;
	}

	clickKeyHandler(key) {
		if (key === 'camera') {
			if (this.state.isPhotoing) return false;
			this.setState({
				camaraActionTxt: '开始拍照',
                isPhotoing: true
			});
		}
        window.socketClient && window.socketClient.emit('KEY_PRESS', JSON.stringify({
			key_type: key
		}));
	}

	clickArrowAreaHandler(e) {
		const {
			nativeEvent: {
				offsetX,
				offsetY
			}
		} = e;
		const angle = calAngle({
			x: this.arrowR,
			y: this.arrowR
		}, {
			x: offsetX,
			y: offsetY
		});
		let btnType;
		if (angle <= 45 && angle >= -45) {
			btnType = 'right';
		}
		if (angle > 45 && angle < 135) {
			btnType = 'up';
		} else if (angle >= 135 && angle < 180) {
			btnType = 'left';
		}
		else if (angle >= -180 && angle < -135) {
			btnType = 'left';
		}
		else if (angle > -135 && angle < -45) {
			btnType = 'down';
		}
		this.clickKeyHandler(btnType);
	};


	componentDidMount() {
		this.arrowR = this.arrowArea.clientWidth / 2;
		window.socketClient = window.socketClient || io('/');
		const thumbImg = this.thumb;
        window.socketClient && window.socketClient.on('camera', (data) => {
			thumbImg.src = data;
			this.setState({
                camaraActionTxt: data,
                isPhotoing: false
			});
		});
	}

    async toggleDeviceOrientationHandler() {
		await this.setState({
            isStartingHanderDeviceOrientationEvent: !this.state.isStartingHanderDeviceOrientationEvent
		});
		if (this.state.isStartingHanderDeviceOrientationEvent) {
            window.addEventListener('deviceorientation', this.deviceOrientationHandler, false);
		} else {
            window.removeEventListener('deviceorientation', this.deviceOrientationHandler, false);
            this.gama = null;
            this.setState({
                gamaValue: ''
			});
		}
	}

    deviceOrientationHandler(e) {
		if (this.gama === null) {
            this.gama = e.gamma;
			return false;
		}
        const angle = e.gamma - this.gama;
		this.setState({
            gamaValue: angle
		});
	}

	render() {
		const {isSupportDeviceOrientationEvent, isStartingHanderDeviceOrientationEvent, gamaValue} = this.state;
		return (
			<div className="lirc-outer">
				{
                    isSupportDeviceOrientationEvent && (
						<div className="powers">
							<div
								className="btn_single"
								onClick={this.toggleDeviceOrientationHandler}
								style={isStartingHanderDeviceOrientationEvent ? {
									backgroundColor: 'green'
								} : {}}
							>
								手机转动{gamaValue}
							</div>
						</div>
					)
				}
				<div className="powers">
					<div
						className="btn_single"
						onClick={(e) => {
							e.preventDefault();
							this.clickKeyHandler('power');
						}}
					>
						电源
					</div>
						<div
		className="btn_single"
		onClick={(e) => {
			e.preventDefault();
			this.clickKeyHandler('camera');
		}}
	>
		截图
		</div>
						<div
		className="btn_single"
		onClick={(e) => {
			e.preventDefault();
			this.clickKeyHandler('powerTV');
		}}
	>
		电视
		</div>
				</div><div>
			<img ref = {node => {
			this.thumb = node;
			}} width={'100%'} />
				<span>{this.state.camaraActionTxt}</span>
		</div>
				<div className="backAndHome">
					<div
						className="btn_single"
						onClick={(e) => {
							e.preventDefault();
							this.clickKeyHandler('back');
						}}
					>
						返回
					</div>
					<div
						className="btn_single"
						onClick={(e) => {
							e.preventDefault();
							this.clickKeyHandler('home');
						}}
					>
						主页
					</div>
				</div>


				<div className="arrowAreaAndEnder">
					<div
						ref = {node => {
							this.arrowArea = node;
						}}
						className="arrowArea"
					    onClick={this.clickArrowAreaHandler}

					/>
					<div
						className="btn_enter"
						onClick={(e) => {
							e.preventDefault();
							this.clickKeyHandler('enter');
						}}
					/>
				</div>
			</div>
		);
	}

}