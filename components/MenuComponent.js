import React, { Component } from 'react';
import { View, FlatList,ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { DISHES } from '../shared/dishes';
import { render } from 'react-dom';
import { Tile } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import * as Animatable from 'react-native-animatable';


const mapStateToProps = state => {
    return {
      dishes: state.dishes
    }
  }

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dishes: DISHES
        };
    }

    static navigationOptions = {
        title: 'Menu'
    };

    
    render() {
        const renderMenuItem = ({ item, index }) => {
        
        const { navigate } = this.props.navigation;

            return (
                <ScrollView style={{margin:20}}>
                     <Animatable.View animation="fadeInRightBig" duration={2000}>                
                <Tile
                    key={index}
                    title={item.name}
                    caption={item.description}
                    featured
                    onPress={() => navigate('Dishdetail', { dishId: item.id })}
                    imageSrc={{ uri: baseUrl + item.image}}
                    />
                </Animatable.View>
                </ScrollView>
                
                
        );
    };

        return (
             
            <FlatList 
                data={this.state.dishes}
                renderItem={renderMenuItem}
                keyExtractor={item => item.id.toString()}
                />
    );

    }
   
}


export default connect(mapStateToProps)(Menu);