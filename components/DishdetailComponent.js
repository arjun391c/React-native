import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder ,Share} from 'react-native';
import { DISHES } from '../shared/dishes';
import { COMMENTS } from '../shared/comments';
import { Card,Icon ,Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { postComment, postFavorite } from '../redux/ActionCreators';
import { baseUrl } from '../shared/baseUrl';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
  }

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});


function RenderDish(props) {
    const dish = props.dish;

    //handleViewRef = ref => this.view = ref;

     const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
     }
     const recognizeCommentDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx > 200)
            return true;
        else
            return false;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
       // onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},

        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            else if (recognizeCommentDrag(gestureState)) {
                props.toggleModal();
            };

            return true;
        }
    })

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }
     
     if (dish != null) {
            return (
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
              //  ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                    <Card
                        featuredTitle={dish.name}
                        //  image={require('./images/uthappizza.png')}>
                        image={{ uri: baseUrl + dish.image }}>
         
                        <Text style={{ margin: 10 }}>
                            {dish.description}
                        </Text>
                        <View style={styles.formRow}>
                            <Icon
                                raised //displays like a button
                                reverse //reversecolor
                                name={props.favorite ? 'heart' : 'heart-o'}
                                type='font-awesome'
                                color='#f50'
                                onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                            />
                            <Icon
                                raised //displays like a button
                                reverse //reversecolor
                                name='pencil'
                                type='font-awesome'
                                color='#512DA8'
                                onPress={() => { props.toggleModal() }}
                            />
                            <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
            
                        </View>
               
                    </Card>
                </Animatable.View>
            );
        }else {
        return (<View></View>);
    };
}


function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
         <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>        
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
            </Card>
              </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
             author: '',
            comment: '',
            rating: 5,
            showModal: false,
            dishes: DISHES,
            comments:COMMENTS,
            favorites: []
        };
        
        
    }
    
    static navigationOptions = {
        title: 'Dish Details'
    };
    
      markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

     toggleModal(){
        this.setState({showModal:!this.state.showModal});
        console.log(this.state.showModal);
    }
    
      handleCommentSubmit(dishId, rating, author, comment) {
        this.props.postComment(dishId, rating, author, comment);
    };


    resetForm(){
        this.setState({
            rating:1,
            author:"",
            comment:""
        });

    }
    

    render() {
        
        const dishId = this.props.navigation.getParam('dishId','');
        return(
           
            <ScrollView>
               <RenderDish dish={this.state.dishes[+dishId]}
                   // favorite={this.state.favorites.some(el => el === dishId)}
                    
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)} 
                    toggleModal={()=>this.toggleModal()}
                />
                
                <Modal
                        style={styles.modal}
                        animationType={'slide'}
                        transparent={false}
                        visible={this.state.showModal}
                        onDismiss={() => {
                            this.toggleModal();
                            this.resetForm();
                        }}
                        onRequestClose={() => {
                            this.toggleModal();
                            this.resetForm();
                        }}>
                        <View style={styles.formRow}>
                            <Rating
                            type="star"
                            ratingCount={5}
                            count={5}
                            imageSize={60}
                            showRating
                            onFinishRating={this.handleRating}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <Input
                            placeholder="Author"
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            leftIconContainerStyle={styles.formIcon}
                            onChangeText={val => this.setState({ author: val })}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <Input
                            placeholder="Comment"
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            leftIconContainerStyle={styles.formIcon}
                            onChangeText={val => this.setState({ comment: val })}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <Button
                            title="SUBMIT"
                            onPress={() => {
                                this.handleCommentSubmit(dishId,
                                    this.state.rating,
                                    this.state.author,
                                    this.state.comment)
                                this.toggleModal();
                                this.resetForm();
                            }}
                            containerStyle={styles.formButton}
                            buttonStyle={{ backgroundColor: '#512DA8' }}
                            />
                        </View>
                        <View style={styles.formRow}>
                        <Button
                            title="CANCEL"
                            onPress={() => {this.toggleModal(); this.resetForm();}}
                            containerStyle={styles.formButton}
                            buttonStyle={{ backgroundColor: '#808080' }}
                            />
                        </View>
                </Modal>




                <RenderComments comments={this.state.comments.filter((comment) => comment.dishId === dishId)} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        margin: 20
    },
    modal: {
        justifyContent: 'center',
        margin: 20,
    },
    formIcon: {
        marginRight: 15
    },
    formButton: {
        flex: 1,
    },
    commentRating: {
        flexDirection: 'row',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
    }
})


export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
