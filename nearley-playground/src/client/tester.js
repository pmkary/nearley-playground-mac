import React, {Component} from 'react'
import nearley from 'nearley'
import Inspector from 'react-inspector'
import gen from './generate.js'

export default class Tester extends Component {
    // state = {
    //     tests: ['1 + 1', 'ln(5 + sin(3 + 4*e))'],
    // };
    setTest(i, test){
        let {tests} = this.props
        let changed = tests.slice(0)
        changed[i] = test
        this.props.setTests(changed)
    }
    deleteTest(i, shouldFocus=false){
        let {tests} = this.props
        let changed = tests.slice(0)
        changed.splice(i, 1)
        this.props.setTests(changed)
        console.log(shouldFocus)
        if(shouldFocus === true) setImmediate(e => {
            this.refs['test'+Math.min(i,changed.length - 1)].focus()
        })
    }
    addTest(){
        let {tests} = this.props
        this.props.setTests([...tests, ''])
        setImmediate(e => {
            this.refs['test'+tests.length].focus()
        })
    }
    genTest(){
        let grammar = get_exports(this.props.grammar)
        let example = gen(grammar, grammar.ParserStart);
        let {tests} = this.props
        this.props.setTests([...tests, example])
    }
    render(){

        let grammar = get_exports(this.props.grammar)

        return <div className='tester' onKeyPress={e => {
            if(e.key === 'Enter' && e.shiftKey) {
                e.preventDefault()
                this.addTest()
            }
        }}>
            <div className='tests'>
                {this.props.tests.map((t, i) => 
                    <Test grammar={grammar} 
                        key={i}
                        ref={'test'+i}
                        setTest={this.setTest.bind(this,i)}
                        deleteTest={this.deleteTest.bind(this,i)}
                        test={t}/>
                )}
            </div>
            <div className='test-create'>
                <div className='test-add'
                    onClick={this.addTest.bind(this)}>+ Add Test</div>
                <div className='test-generate'
                    onClick={this.genTest.bind(this)}>Generate</div>
            </div>
        </div>
    }
}

function get_exports(source){
    let module = {exports:''}
    eval(source)
    return module.exports
}


class Test extends Component {
    focus(){
        this.refs.input.focus()
    }
    keyDown(e){
        if(e.key === "Backspace" && e.target.value === '')
            this.props.deleteTest(true)
    }
    render(){
        let outputs = [];

        try {

            let {ParserRules, ParserStart} = this.props.grammar
            let parser = new nearley.Parser( ParserRules, ParserStart )
            parser.feed(this.props.test)
            outputs = parser.results
            
        } catch(e) {
            // console.log(e, this.props)
        }

        setImmediate(e => {
            if(!this.refs.input) return
            this.refs.input.style.height = 0
            this.refs.input.style.height = this.refs.input.scrollHeight
        })

        return <div className={'test ' + (outputs.length > 0 ? 'match' : '')}>
            <div className='test-x' onClick={this.props.deleteTest}>
                <div>{'\u00d7'}</div>
            </div>
            <textarea 
                ref='input'
                placeholder="Type a test..."
                onInput={e => this.props.setTest(e.target.value)}
                onChange={e => this.props.setTest(e.target.value)}
                value={this.props.test}
                onKeyDown={this.keyDown.bind(this)}
                />
            {outputs.map((output, i) => 
                <div className='output' key={i}>
                    <Inspector data={output}/>
                </div>)}
        </div>
    }
}