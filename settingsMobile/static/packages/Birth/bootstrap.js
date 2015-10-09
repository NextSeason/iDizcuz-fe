J.Package( {
    initialize : function() {
        this.containerEl = $( '.birth-area' );
        this.yearSelectEl = $( 'select.birth-year' );
        this.monthSelectEl = $( 'select.birth-month' );
        this.dateSelectEl = $( 'select.birth-date' );
        this.createDom();
        this.bindEvent();
    },

    bindEvent : function() {
        var me = this;
        this.yearSelectEl.on( 'change', function( e ) {
            if( $( this ).val() == 0 ) {
                me.createMonthDom();
            }
            me.refreshDate();
        } );

        this.monthSelectEl.on( 'change', function( e ) {
            me.refreshDate();
        } );
    },

    setDefault : function() {
        var defaultDate = this.containerEl.attr( 'date-birth' ),
            year = defaultDate.substr( 0, 4 ),
            month = defaultDate.substr( 5, 2 ),
            date = defaultDate.substr( 8, 2 );

        this.yearSelectEl.find( 'option' ).each( function() {
            $( this ).val() == year && $( this ).prop( 'selected', true );
        } );

        this.monthSelectEl.find( 'option' ).each( function() {
            +$( this ).val() == +month && $( this ).prop( 'selected', true );
        } );

        this.dateSelectEl.find( 'option' ).each( function() {
            +$( this ).val() == +date && $( this ).prop( 'selected', true );
        } );

    },

    createDom : function() {
        this.createYearDom();
        this.createMonthDom();
        this.refreshDate();
        this.setDefault();
    },

    createYearDom : function() {
        var start = 1911,
            end = (new Date).getFullYear(),
            options = [ '<option value="0">年</option>' ];

        for( i = end; i >= start; i -= 1 ) {
            options.push( '<option value="' + i + '">' + i + '</option>' );
        }
        this.yearSelectEl.html( options.join('') );

    },

    createMonthDom : function() {
        var options = [ '<option value="0">月</option>' ];

        for( i = 1; i < 13; i += 1 ) {
            options.push( '<option value="' + i + '">' + i + '</option>' );
        }

        this.monthSelectEl.html( options.join('') );
    },

    refreshDate : function() {
        var year = this.getCurrentYear(),
            month = this.getCurrentMonth(),
            end = 31,
            options = [ '<option value="0">日</option>' ];

        if( month == 4 || month == 6 || month == 9 || month == 11 ) {
            end = 30;
        }

        if( month == 2 ) {
            end = year % 4 ? 28 : 29;
        }

        for( i = 1; i <= end; i += 1 ) {
            options.push( '<option value="' + i + '">' + i + '</option>' );
        }
        this.dateSelectEl.html( options.join('') );

    },

    getCurrentYear : function() {
        return this.yearSelectEl.val();
    },

    getCurrentMonth : function() {
        return this.monthSelectEl.val();
    },

    getCurrentDate : function() {
        return this.dateSelectEl.val();
    }
} );
