/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout, window */

import HtmlDataProcessor from 'ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import xssTemplates from 'ckeditor5-engine/tests/dataprocessor/_utils/xsstemplates';
import ViewDocumentFragment from 'ckeditor5-engine/src/view/documentfragment';
import { stringify, parse } from 'ckeditor5-engine/src/dev-utils/view';

describe( 'HtmlDataProcessor', () => {
	const dataProcessor = new HtmlDataProcessor();

	describe( 'toView', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );
			expect( fragment ).to.be.an.instanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( stringify( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should return only elements inside body tag', () => {
			const fragment = dataProcessor.toView( '<html><head></head><body><p>foo</p></body></html>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( stringify( fragment ) ).to.equal( 'foo <b>bar</b> text' );
		} );

		// Test against XSS attacks.
		for ( let name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, ( done ) => {
				window.testXss = sinon.spy();
				dataProcessor.toView( input );

				setTimeout( () => {
					sinon.assert.notCalled( window.testXss );
					done();
				}, 10 );
			} );
		}
	} );

	describe( 'toData', () => {
		it( 'should return empty string when empty DocumentFragment is passed', () => {
			const fragment = new ViewDocumentFragment();

			expect( dataProcessor.toData( fragment ) ).to.equal( '' );
		} );

		it( 'should return text if document fragment with single text node is passed', () => {
			const fragment = new ViewDocumentFragment();
			fragment.appendChildren( parse( 'foo bar' ) );

			expect( dataProcessor.toData( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );
	} );
} );
