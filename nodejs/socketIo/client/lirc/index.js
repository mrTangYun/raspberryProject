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
	}

	clickKeyHandler(key) {
		this.socket && this.socket.emit('KEY_PRESS', JSON.stringify({
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
		this.socket = io('/');
	}

	render() {
		return (
			<div className="lirc-outer">
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