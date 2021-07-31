<?php

$annonces = json_decode(file_get_contents('annonces.json'), true);

$categoryFiltered = !empty($_GET['category']) ? htmlspecialchars($_GET['category']) : null;

if ($categoryFiltered) {
    $annonces = array_values(array_filter($annonces, function(array $annonce) use ($categoryFiltered) {
        return $annonce['category'] === $categoryFiltered;
    }));
}

//echo '<pre>' . var_export($annonces, true) . '</pre>';

function dateToString(?string $dateString): ?string {
	if (!trim($dateString)) {
		return null;	
	}
	
	try {
	return (new Datetime($dateString))->format('D d/m');
	} catch (\Exception $e) {
		return null;
	}
}

?>

<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Annonces - Radioamateur.org</title>
	<style>
		table {
		  border: 1px solid #1C6EA4;
		  background-color: #EEEEEE;
		  width: 100%;
		  text-align: left;
		  border-collapse: collapse;
		}
		table td, tableth {
		  border: 1px solid #AAAAAA;
		  padding: 3px 6px;
		}
		table tr:nth-child(even) {
		  background: #D0E4F5;
		}
		table thead {
		  background: #1C6EA4;
		  background: -moz-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
		  background: -webkit-linear-gradient(top, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
		  background: linear-gradient(to bottom, #5592bb 0%, #327cad 66%, #1C6EA4 100%);
		  border-bottom: 2px solid #444444;
		}
		table thead th {
		  font-size: 15px;
		  font-weight: bold;
		  color: #FFFFFF;
		  border-left: 2px solid #D0E4F5;
		}
		table thead th:first-child {
		  border-left: none;
		}
		table td img {
		  max-width: 500px;
	    }
	</style>
</head>
<body>
	<h1>Annonces - Radioamateur.org</h1>
	
	<p><strong><?= count($annonces) ?></strong> annonces publiées entre le <?= dateToString($annonces[count($annonces) - 1]['date']) ?> et le <?= dateToString($annonces[0]['date']) ?></p>
	
	<?php if ($categoryFiltered): ?>
	    <p>Annonces filtrées sur la catégorie <?= $categoryFiltered ?>. <a href="?">Tout voir</a></p>
	<?php endif; ?>
	
	<table>
		<thead>
			<tr>
				<th>Titre</th>
				<th>Catégorie</th>
				<th>Date</th>
				<th>Prix</th>
				<th>Photo</th>
				<th>Departement</th>
				<th>Id</th>
			</tr>
		</thead>
		
		<tbody>
			<?php foreach ($annonces as $annonce): ?>
			    <tr>
				    <td><a target="_blank" href="<?= $annonce['link'] ?>"><?= $annonce['title'] ?></td>
				    <td><a href="?category=<?= $annonce['category'] ?>"><?= $annonce['category'] ?? '-' ?></a></td>
				    <td><?= dateToString($annonce['date']) ?></td>
				    <td><?= $annonce['price'] ? $annonce['price'] . ' €' : '-' ?></td>
				    <td><?= !empty($annonce['photos']) ? '<a target="_blank" href="' . $annonce['link'] . '"><img src="' . $annonce['photos'][0] . '" /></a>' : '-' ?></td>
				    <td><?= $annonce['departement'] ?? '-' ?></td>
				    <td><?= $annonce['id'] ?? '-' ?></td>
			    </tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</body>
</html>
