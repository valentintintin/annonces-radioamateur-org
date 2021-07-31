const cheerio = require('cheerio');
const https = require('https');
const moment = require('moment');
const fs = require('fs');
const feed = require('feed');

moment.locale('fr');

const rss = new feed.Feed({
  title: 'Annonces - Radioamateur.org',
  description: 'Liste les annonces du site radioamateur.org',
  id: 'https://radioamateur.org',
  link: 'https://radioamateur.org',
  language: 'fr',
  image: 'https://radioamateur.org/images/logo_v2.png',
  favicon: 'https://radioamateur.org/images/favicon.ico',
  feedLinks: {
    rss: 'https://pixel-server.ovh/annonces-radioamateur-org/rss.xml',
  },
  author: {
    name: 'Valentin Saugnier - F4HVV',
    email: 'valentin.s.10@gmail.com',
    link: 'https://valentin-saugnier.fr'
  },
  ttl: 60
});

let items = [];
const categories = [];
const baseUrl = 'https://radioamateur.org';
const doAllAndSave = true;

doPage();

function doPage(page = 0) {
    console.log('Page', page);

    (async () => {
	    https.get(baseUrl + (page ? '/toutes/page/' + page : ''), (resp) => {
		    let data = '';

		    resp.on('data', (chunk) => {
			    data += chunk;
		    });

		    resp.on('end', () => {
			    const $ = cheerio.load(data);
                
                const cards = $('.container .card');
                
                console.log('Annonces', cards.length);
                
                if (cards.length > 0) {
                    cards.each((i, el) => {
                        const element = $(el);
                    
                        const elCardBody = element.find('.card-body');
                        const categorie = $(elCardBody.find('a > span')).text();
                        
                        if (categorie === 'Recherche') {
                            return;
                        }
                        
                        const idElement = element.find('.card-header .align-middle');
                        const id = parseInt(idElement.text().trim().replace('n° ', ''));
        	            if (items.find(i => i.id === id)) {
        	                return;
        	            }
        	            
                        const seller = $(elCardBody.find('span > b')).text();
                        const price = $($(element.find('.card-footer').children()[0]).children()[0]).text().trim().replace(' €', '');
                        const date = $(element.find('.card-header + .card-body')).text().split('Date:')[1].split('Déposé')[0].trim();
                        const title = element.find('.titre-annonce');
                        const departement = parseInt(idElement.next().attr("href").replace('/departement/', ''));
                                                
                        const imgs = [];
                        element.find('.highslide-gallery .highslide').each((i, el) => {
                            imgs.push(baseUrl + $(el).attr('href'));
                        });

                        item = {
                            id: id,
                            title: title.text().trim(),
                            departement: departement,
                            link: baseUrl + title.attr('href'),
                            category: categorie,
                            date: moment(date, 'DD MMMM YYYY', 'fr').format('YYYY-MM-DD'),
                            content: $(elCardBody.last()).text().trim(),
                            seller: seller ? seller.toUpperCase() : null,
                            price: price ? parseFloat(price) : null,
                            photos: imgs
                        };

			            console.log(item);
			            
			            items.push(item);
			            
        	            if (!categories.includes(categorie)) {
        	                categories.push(categorie);
        	                rss.addCategory(categorie);
                        }     
                    });
			         
			        if (doAllAndSave) {
    		            doPage(page + 1);
		            }
                }
                else {
                    items = items.sort((a, b) => a.id < b.id ? 1 : -1);
                                
                    fs.writeFile('annonces.json', JSON.stringify(items), function (err) {
                      if (err) return console.error(err);
                        console.log(items.length);
                    });
                    
                    items.forEach(item => {                    
                        rss.addItem({
                            id: item.id,
                            title: item.titre,
                            link: item.link,
                            category: [{
                                name: item.categorie
                            }],
                            description: item.content.substring(0, 140),
                            content: item.content,
                            author: item.seller ? [
                              {
                                name: item.seller
                              }
                            ] : null,
                            date: new Date(item.date),
                            image: item.photos.length > 0 ? item.photos[0] : null
                        });
                    });
                    
                    fs.writeFile('rss.xml', rss.rss2(), function (err) {
                      if (err) return console.error(err);
                    });
                }
		    });
	    });
    })();
}
